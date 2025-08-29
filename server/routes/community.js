import express from 'express';
import { 
  communityHelpers, 
  commentHelpers, 
  favoriteHelpers, 
  activityHelpers,
  profileHelpers 
} from '../config/supabase.js';

const router = express.Router();

// Middleware to extract user profile from token
const getUserProfile = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      req.userProfile = null;
      return next();
    }
    
    // TODO: Implement proper JWT token validation
    // For now, we'll extract bungie_id from request headers
    const bungieId = req.headers['x-bungie-id'];
    
    if (bungieId) {
      const profiles = await profileHelpers.findByBungieId(bungieId);
      if (profiles && profiles.length > 0) {
        req.userProfile = profiles[0];
      }
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.userProfile = null;
    next();
  }
};

// Middleware to require authentication
const requireAuth = (req, res, next) => {
  if (!req.userProfile || !req.userProfile.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// GET /api/community/posts
router.get('/posts', getUserProfile, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      post_type, 
      featured, 
      tags 
    } = req.query;
    
    const filters = {};
    if (post_type) filters.post_type = post_type;
    if (featured === 'true') filters.featured = true;
    if (tags) filters.tags = tags.split(',');
    
    const posts = await communityHelpers.getPosts(filters, parseInt(page), parseInt(limit));
    
    // Log activity if user is authenticated
    if (req.userProfile?.id) {
      await activityHelpers.logActivity(req.userProfile.id, 'community_browse', {
        filters,
        page: parseInt(page)
      });
    }
    
    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
});

// GET /api/community/posts/:id
router.get('/posts/:id', getUserProfile, async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await communityHelpers.getPostById(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Increment view count
    await communityHelpers.incrementViews(id);
    
    // Get comments for the post
    const comments = await commentHelpers.getPostComments(id);
    
    // Log activity if user is authenticated
    if (req.userProfile?.id) {
      await activityHelpers.logActivity(req.userProfile.id, 'post_view', {
        post_id: id,
        post_title: post.title
      });
    }
    
    res.json({
      success: true,
      post: {
        ...post,
        comments
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to retrieve post' });
  }
});

// POST /api/community/posts
router.post('/posts', getUserProfile, requireAuth, async (req, res) => {
  try {
    const postData = req.body;
    
    // Validate required fields
    if (!postData.title || !postData.content || !postData.post_type) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, content, post_type' 
      });
    }
    
    // Validate post_type
    const validPostTypes = ['build', 'guide', 'discussion', 'question', 'showcase'];
    if (!validPostTypes.includes(postData.post_type)) {
      return res.status(400).json({ 
        error: 'Invalid post_type. Must be one of: ' + validPostTypes.join(', ')
      });
    }
    
    const newPost = await communityHelpers.createPost(req.userProfile.id, postData);
    
    await activityHelpers.logActivity(req.userProfile.id, 'post_create', {
      post_id: newPost.id,
      post_type: newPost.post_type,
      post_title: newPost.title
    });
    
    res.json({
      success: true,
      post: newPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/community/posts/:id
router.put('/posts/:id', getUserProfile, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Check if user owns the post
    const post = await communityHelpers.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.profile_id !== req.userProfile.id) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }
    
    const updatedPost = await communityHelpers.updatePost(id, updates);
    
    await activityHelpers.logActivity(req.userProfile.id, 'post_update', {
      post_id: id
    });
    
    res.json({
      success: true,
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/community/posts/:id
router.delete('/posts/:id', getUserProfile, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user owns the post
    const post = await communityHelpers.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.profile_id !== req.userProfile.id) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }
    
    await communityHelpers.deletePost(id);
    
    await activityHelpers.logActivity(req.userProfile.id, 'post_delete', {
      post_id: id
    });
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// POST /api/community/posts/:id/upvote
router.post('/posts/:id/upvote', getUserProfile, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    await communityHelpers.upvotePost(id);
    
    await activityHelpers.logActivity(req.userProfile.id, 'post_upvote', {
      post_id: id
    });
    
    res.json({
      success: true,
      message: 'Post upvoted successfully'
    });
  } catch (error) {
    console.error('Upvote post error:', error);
    res.status(500).json({ error: 'Failed to upvote post' });
  }
});

// POST /api/community/posts/:id/comments
router.post('/posts/:id/comments', getUserProfile, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parent_comment_id } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    if (content.length > 2000) {
      return res.status(400).json({ error: 'Comment too long (max 2000 characters)' });
    }
    
    const newComment = await commentHelpers.createComment(
      req.userProfile.id, 
      id, 
      content.trim(), 
      parent_comment_id
    );
    
    await activityHelpers.logActivity(req.userProfile.id, 'comment_create', {
      post_id: id,
      comment_id: newComment.id,
      parent_comment_id
    });
    
    res.json({
      success: true,
      comment: newComment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// PUT /api/community/comments/:id
router.put('/comments/:id', getUserProfile, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    if (content.length > 2000) {
      return res.status(400).json({ error: 'Comment too long (max 2000 characters)' });
    }
    
    // TODO: Check if user owns the comment
    const updatedComment = await commentHelpers.updateComment(id, {
      content: content.trim(),
      updated_at: new Date().toISOString()
    });
    
    await activityHelpers.logActivity(req.userProfile.id, 'comment_update', {
      comment_id: id
    });
    
    res.json({
      success: true,
      comment: updatedComment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// DELETE /api/community/comments/:id
router.delete('/comments/:id', getUserProfile, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Check if user owns the comment
    await commentHelpers.deleteComment(id);
    
    await activityHelpers.logActivity(req.userProfile.id, 'comment_delete', {
      comment_id: id
    });
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// POST /api/community/comments/:id/upvote
router.post('/comments/:id/upvote', getUserProfile, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    await commentHelpers.upvoteComment(id);
    
    await activityHelpers.logActivity(req.userProfile.id, 'comment_upvote', {
      comment_id: id
    });
    
    res.json({
      success: true,
      message: 'Comment upvoted successfully'
    });
  } catch (error) {
    console.error('Upvote comment error:', error);
    res.status(500).json({ error: 'Failed to upvote comment' });
  }
});

// GET /api/community/favorites
router.get('/favorites', getUserProfile, requireAuth, async (req, res) => {
  try {
    const { type } = req.query;
    
    const favorites = await favoriteHelpers.getUserFavorites(req.userProfile.id, type);
    
    res.json({
      success: true,
      favorites
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to retrieve favorites' });
  }
});

// POST /api/community/favorites
router.post('/favorites', getUserProfile, requireAuth, async (req, res) => {
  try {
    const { favorite_type, favorite_id } = req.body;
    
    if (!favorite_type || !favorite_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: favorite_type, favorite_id' 
      });
    }
    
    const validTypes = ['post', 'loadout', 'item'];
    if (!validTypes.includes(favorite_type)) {
      return res.status(400).json({ 
        error: 'Invalid favorite_type. Must be one of: ' + validTypes.join(', ')
      });
    }
    
    // Check if already favorited
    const isFavorite = await favoriteHelpers.isFavorite(
      req.userProfile.id, 
      favorite_type, 
      favorite_id
    );
    
    if (isFavorite) {
      return res.status(400).json({ error: 'Already in favorites' });
    }
    
    const newFavorite = await favoriteHelpers.addFavorite(
      req.userProfile.id, 
      favorite_type, 
      favorite_id
    );
    
    await activityHelpers.logActivity(req.userProfile.id, 'favorite_add', {
      favorite_type,
      favorite_id
    });
    
    res.json({
      success: true,
      favorite: newFavorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// DELETE /api/community/favorites
router.delete('/favorites', getUserProfile, requireAuth, async (req, res) => {
  try {
    const { favorite_type, favorite_id } = req.body;
    
    if (!favorite_type || !favorite_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: favorite_type, favorite_id' 
      });
    }
    
    await favoriteHelpers.removeFavorite(
      req.userProfile.id, 
      favorite_type, 
      favorite_id
    );
    
    await activityHelpers.logActivity(req.userProfile.id, 'favorite_remove', {
      favorite_type,
      favorite_id
    });
    
    res.json({
      success: true,
      message: 'Removed from favorites successfully'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

export default router;