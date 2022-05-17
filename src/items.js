class Item {
  constructor(data) {
    this.id = data.id;
    this.description = data.description;
    this.weight = data.weight;
    this.tools = data.tools;
    this.tags = data.tags;
  }

  get name() {
    // Get the name of the item from the localisation.
    return localisation['en'][this.id] || this.id;
  }

  static getItemsByBiome(biome) {
    // Get all the items that can be found in this biome.
    // Biome can be found either from the item data or the variant data.
    const result = [];
    for(const item of items) {

      if(item.variants.length > 0) {
        for(const variant of item.variants) {
          if(variant.biomes.includes(biome)) {
            // Add the item variant to the result.
            // also set the id to be the item id plus the variant id.
            result.push({
              id: item.id + '_' + variant.id,
              description: variant.description,
              weight: variant.weight,
              tools: variant.tools,
              tags: variant.tags
            });
          }
        }
      } else if(item.biomes.includes(biome)) {
        result.push(item);
      }
    }
    
    return result;
  }

}

class Recipe {
  constructor(data) {
    this.ingredients = data.ingredients;
    this.result = data.result;
  }
}