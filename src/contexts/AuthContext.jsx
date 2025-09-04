import React, { createContext, useContext, useEffect, useState } from 'react';
import BungieAuthService from '../services/bungieAuth';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bungieConnection, setBungieConnection] = useState(null)

  // Check Bungie authentication status
  const checkBungieAuth = async () => {
    try {
      setLoading(true)
      const isConnected = await BungieAuthService.isConnected()
      
      if (isConnected) {
        const connection = await BungieAuthService.getBungieConnection()
        setBungieConnection(connection)
        setUser({
          id: connection?.bungie_user_id,
          displayName: connection?.display_name || 'Guardian',
          bungieId: connection?.bungie_user_id,
          membershipId: connection?.membership_id,
          membershipType: connection?.membership_type,
          isAuthenticated: true
        })
      } else {
        setBungieConnection(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setBungieConnection(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkBungieAuth()
  }, [])

  // Authentication methods
  const signInWithBungie = () => {
    BungieAuthService.initiateOAuth()
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await BungieAuthService.disconnect()
      setUser(null)
      setBungieConnection(null)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshAuth = async () => {
    await checkBungieAuth()
  }

  const value = {
    user,
    loading,
    bungieConnection,
    isAuthenticated: !!user?.isAuthenticated,
    signInWithBungie,
    signOut,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
