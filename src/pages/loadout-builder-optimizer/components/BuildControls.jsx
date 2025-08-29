import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const BuildControls = ({ 
  selectedBuild, 
  onBuildSelect, 
  onSaveBuild, 
  onShareBuild, 
  onImportBuild,
  selectedActivity,
  onActivityChange,
  builds = []
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [buildName, setBuildName] = useState('');
  const [importData, setImportData] = useState('');

  const activityOptions = [
    { value: 'pve', label: 'PvE General', description: 'Strikes, Gambit, Patrol' },
    { value: 'raid', label: 'Raid', description: 'Endgame PvE content' },
    { value: 'pvp', label: 'PvP', description: 'Crucible matches' },
    { value: 'trials', label: 'Trials', description: 'Competitive PvP' },
    { value: 'dungeon', label: 'Dungeon', description: 'Solo/Team challenges' },
    { value: 'grandmaster', label: 'Grandmaster', description: 'Nightfall strikes' }
  ];

  const buildOptions = builds?.map(build => ({
    value: build?.id,
    label: build?.name,
    description: `${build?.activity} • ${build?.class}`
  }));

  const handleSave = () => {
    if (buildName?.trim()) {
      onSaveBuild(buildName?.trim());
      setBuildName('');
      setShowSaveDialog(false);
    }
  };

  const handleImport = () => {
    if (importData?.trim()) {
      onImportBuild(importData?.trim());
      setImportData('');
      setShowImportDialog(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Build Selection */}
        <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
          <div className="lg:w-64">
            <Select
              label="Current Build"
              placeholder="Select a build..."
              options={buildOptions}
              value={selectedBuild?.id || ''}
              onChange={(value) => onBuildSelect(value)}
              searchable
              clearable
            />
          </div>

          <div className="lg:w-48">
            <Select
              label="Activity Type"
              options={activityOptions}
              value={selectedActivity}
              onChange={onActivityChange}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Save"
            iconPosition="left"
            onClick={() => setShowSaveDialog(true)}
          >
            Save
          </Button>

          <Button
            variant="outline"
            size="sm"
            iconName="Share"
            iconPosition="left"
            onClick={onShareBuild}
          >
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={() => setShowImportDialog(true)}
          >
            Import
          </Button>

          <Button
            variant="ghost"
            size="sm"
            iconName="RotateCcw"
            iconPosition="left"
          >
            Reset
          </Button>
        </div>
      </div>
      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">Save Build</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSaveDialog(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                label="Build Name"
                placeholder="Enter build name..."
                value={buildName}
                onChange={(e) => setBuildName(e?.target?.value)}
                required
              />

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!buildName?.trim()}
                >
                  Save Build
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-foreground">Import Build</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowImportDialog(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Build Data
                </label>
                <textarea
                  className="w-full h-32 px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Paste build data here..."
                  value={importData}
                  onChange={(e) => setImportData(e?.target?.value)}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Supports DIM, Destiny Item Manager, and community build formats.
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowImportDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!importData?.trim()}
                >
                  Import Build
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildControls;