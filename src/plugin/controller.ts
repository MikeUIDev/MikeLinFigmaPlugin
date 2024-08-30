figma.showUI(__html__, { width: 300, height: 400 });

// The function will return a list of objects, each containing a layer's name and an unique ID. ID will not be displayed
// Example:
// Name: 2-wheels
// ID: 82794:20451
function getLayerNames(node: SceneNode): { name: string, id: string }[] {
  const layerNames = [{ name: node.name, id: node.id }];

  // Find and retrive if a node (layer) has more layers (children) nested and will keep looping
  if ("children" in node) {
    for (const child of node.children) {
      layerNames.push(...getLayerNames(child));
    }
  }

  return layerNames;
}

figma.ui.onmessage = msg => {
  // Looks for all the layers in the current page if message type is get-layers and store them
  if (msg.type === 'get-layers') {
    const layers = figma.currentPage.children;
    let layerNames = layers.flatMap(layer => getLayerNames(layer));

    // Sort alphabetically
    layerNames = layerNames.sort((a, b) => a.name.localeCompare(b.name));

    // Gather and sort names and send this information back to UI to display names
    figma.ui.postMessage({ type: 'layers', layerNames });

    // Check if message type is rename-layers. It means the user wants to rename layer(s)
  } else if (msg.type === 'rename-layers') {
    // For each selected layer (identified by its ID),
    // the plugin finds the layer in the Figma file and changes
    // its name to the new one provided by the user
    msg.ids.forEach((id: string) => {
      const selectedLayer = figma.getNodeById(id) as SceneNode;
      if (selectedLayer) {
        selectedLayer.name = msg.newName;
      }
    });

    // Display message
    figma.notify(`Your selected layer(s) has renamed to "${msg.newName}"`);
  }
};