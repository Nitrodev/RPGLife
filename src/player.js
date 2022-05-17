class Player {
  constructor() {
    this.name = "John Doe";
    this.stats = { vitality: 1, strength: 1, dexterity: 1, intelligence: 1 };
    this.skills = [];
    this.inventory = [];
    this.knowledge = [];
    /** @type {Position} */
    this.position = new Position(0, 0);
    /** @type {Place} */
    this.location = null;
  }

  move(direction) {
    // Only move if the players location is null
    if (this.location === null) {
      this.position = this.position.add(direction);
    }
  }

  enter(place) {
    this.location = place;
  }

  exit() {
    let worldPlace = world.getPlaceAt(this.position);
    let subplace = worldPlace.findPlace(this.location);
    
    if (this.location === subplace) {
      // The players location is in the world place so we can exit it to the world place
      this.location = null;
    } else {
      // We are probably in a building or something like that
      // so we need to exit to the subplace
      this.location = subplace;
      
    }
  }

  /**
   * Add an item to the player's inventory, or increase the quantity of an item
   * @param {Item} item 
   * @param {Number} quantity 
   */
  take(item, quantity = 1) {
    let foundItem = this.findItem(item.id);
    if (foundItem) {
      foundItem.quantity += quantity;
    } else {
      this.inventory.push({item, quantity});
    }
  }

  /**
   * Add knowledge to the player
   */
  addKnowledge(knowledge) {
    // For now, only thing in knowledge is recipes
    this.knowledge.push(knowledge);
  }

  /**
   * Find an item in the player's inventory
   * @param {string} value The search value (name or id)
   * @returns {Object} The {item, quantity} object or null if not found
   */
  findItem(value) {
    for (let item of this.inventory) {
      if (item.name === value || item.id === value) {
        return item;
      }
    }
  }



}

class Skill {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }
}