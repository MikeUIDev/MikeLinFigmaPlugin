import React from 'react';
import '../styles/ui.css';

type Layer = {
  name: string;
  id: string;
};

function App() {
  // Set default and set new state when triggered
  const [layerNames, setLayerNames] = React.useState<Layer[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [filteredLayerNames, setFilteredLayerNames] = React.useState<Layer[]>([]);
  const [selectedLayerIds, setSelectedLayerIds] = React.useState<string[]>([]);
  const [newLayerName, setNewLayerName] = React.useState<string>('');

  // This executes when the plugin runs and listens for messages from controller.ts
  // If contains type layers (node) it will update and display layer names
  React.useEffect(() => {
    window.onmessage = (event) => {
      const { type, layerNames } = event.data.pluginMessage;
      if (type === 'layers') {
        setLayerNames(layerNames);
        setFilteredLayerNames(layerNames); // Initialize filtered names
      }
    };
    parent.postMessage({ pluginMessage: { type: 'get-layers' } }, '*');
  }, []);

  // Runs everytime when user starts typing in the search bar
  // It updates the query and filters the list that matches the user has typed
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    // include toLowerCase so that the search will find the name regardless of capitalization
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredLayerNames(layerNames.filter(layer => layer.name.toLowerCase().includes(query)));
  };

  // It runs when an user select or deselect layer names from the select menu
  const handleLayerSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map(option => option.value);
    setSelectedLayerIds(selectedOptions);
  };

  // Get called when Rename button is clicked
  // It sends a message to the controller.ts backend telling it to rename the layers the user has selected
  const handleRename = () => {
    parent.postMessage({
      pluginMessage: {
        type: 'rename-layers',
        ids: selectedLayerIds,
        newName: newLayerName,
      },
    }, '*');
  };

  return (
    <div>
      <h3>Find and Replace Layer Names</h3>
      <input
        type="text"
        placeholder="Search layer name..."
        value={searchQuery}
        onChange={handleSearch}
        style={{ marginBottom: '10px', width: '100%' }}
      />
      <select
        multiple
        value={selectedLayerIds}
        onChange={handleLayerSelection}
        style={{ width: '100%', height: '150px', padding: '10px' }}
      >
        {filteredLayerNames.map((layer, index) => (
          <option key={index} value={layer.id}>
            {layer.name}
          </option>
        ))}
      </select>
      <p>Hold command or ctrl to select multiple names</p>
      <input
        type="text"
        placeholder="Enter new name"
        value={newLayerName}
        onChange={(e) => setNewLayerName(e.target.value)}
        style={{ marginTop: '10px', width: '100%' }}
      />
      <button onClick={handleRename} style={{ marginTop: '20px', marginLeft: '0', marginRight: '0', width: '100%'}}>
        Rename
      </button>
    </div>
  );
};

export default App;