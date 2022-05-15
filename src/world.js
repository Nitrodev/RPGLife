class World {

  constructor() {
    /** @type {Place[]} */
    this.places = [];
  }

  /** 
   * Add a place to the world.
   * @param {Place} place
   */
  addPlace(place) {
    this.places.push(place);
  }

  /** Check direction and return the place in that direction.
   * @param {Position} origin The position of the origin.
   * @param {Direction} direction The direction to check.
   * @return {Place}
   */
  look(origin, direction) {
    const place = this.places.find(p => p.position.equals(origin.add(Direction[direction.toUpperCase()])));
    if (place) {
      return place;
    }
    return null;
  }

  /**
   * Get place by position.
   * @param {Position} position
   * @return {Place}
   */
  getPlaceAt(position) {
    return this.places.find(p => p.position.equals(position));
  }

}

/** 
 * A place in the world.
 * @param {Position} position The position of the place.
 * @param {string} name The name of the place.
 * @param {string} description The description of the place.
 * @param {string[]} tags The tags of the place.
 */
class Place {
  constructor(position, name = '', tags) {
    /** @type {Position} */
    this.position = position;
    this.name = name;
    this.tags = tags || [];

    /** An array of Item Quantity objects */
    this.items = [];
    this.entities = [];

    /** 
     * Some places have places that are inside them. 
     * These can be buildings, rooms, etc.
     * The player can enter one of these places without using a direction.
     * But only if the player is in the correct place.
     */
    this.subplaces = [];
  }

  get description() {
    // For the description, we want to show the name of the place if it has one.
    // Then we want to list all the items a player can see.
    // Then we want to list all the entities a player can see.
    // Then we want to list all the subplaces a player can see.

    let description = '';
    if (this.name) {
      description += `It is called ${this.name}.`;
    }

    if (this.items.length > 0) {
      // Show the items.
      // If the item is renewable, don't show the quantity.
      description += `\nYou see `;
      this.items.forEach((item, index) => {
        const lastLetter = item.item.name.slice(-1);
        if(item.item.tags.includes('renewable')) {
          if(isVowel(lastLetter)) {
            description += `${item.item.name}s`;
          } else {
            description += `${item.item.name}es`;
          }
        } else {
          description += `${item.quantity} `;

          if(item.quantity > 1) {
            if(isVowel(lastLetter)) {
              description += `${item.item.name}s`;
            } else {
              description += `${item.item.name}es`;
            }
          } else {
            description += `${item.item.name}`;
          }
        }
        if(index < this.items.length - 1) {
          // If the index is the second to last item, add an and.
          if(index === this.items.length - 2) {
            description += ` and `;
          } else {
            description += `, `;
          }
        } else {
          description += `.`;
        }
      });
    }

    if (this.entities.length > 0) {
      description += ` You see a ${this.entities.map(e => e.name).join(' and a ')} here.`;
    }

    if (this.subplaces.length > 0) {
      if(this.subplaces.length === 1) {
        description += ` You see a ${this.subplaces[0].tags[0]} here.`;
      } else {
        description += ` You can see a ${this.subplaces.map(p => p.tags[0]).join(' and a ')} here.`;
      }
    }

    return description;
  }
  
  /**
   * Find a place in the place.
   * @param {String} value The value to search for.
   * @returns {Place}
   */
  findPlace(value) {
    // Check if the value is a place.
    let place = this.subplaces.find(p => p === value);
    if (place) {
      return place;
    }

    // check if the value is a place name.
    place = this.subplaces.find(p => p.name === value);
    if (place) {
      return place;
    }

    // check if the value is a tag.
    place = this.subplaces.find(p => p.tags.includes(value));
    if (place) {
      return place;
    }

  }

  /**
   * Add a place to the place.
   * @param {Place} place
   */
   addPlace(place) {
    // If the place is already in the place, update it.
    const existingPlace = this.subplaces.find(p => p.name === place.name);
    if (existingPlace) {
      Object.assign(existingPlace, place);
    } else {
      this.subplaces.push(place);
    }
  }

  findItem(value) {
    // Check if the value is an item.
    let item = this.items.find(i => i.item === value);
    if (item) {
      return item;
    }

    // check if the value is an item name.
    item = this.items.find(i => i.item.name === value);
    if (item) {
      return item;
    }

    // check if the value is an id.
    item = this.items.find(i => i.item.id === value);
    if (item) {
      return item;
    }

  }

  addItem(item, quantity = 1) {
    // If the item is renewable, don't show the quantity.
    if(item?.tags?.includes('renewable')) {
      this.items.push({
        item: new Item(item),
      });
    } else {
      this.items.push({
        item: new Item(item),
        quantity: quantity
      });
    }
  }

  /**
   * Generate an item based on the places first tag (if it is a biome).
   */
  generateItems() {
    if(getTagType(this.tags[0]) === 'biome') {
      // Get all the items that can be found in this biome.
      const potentialItems = Item.getItemsByBiome(this.tags[0]);
      // Pick a random item.
      if(potentialItems.length > 0) {
        
        // First let's make sure we generate all renewable items.
        const renewableItems = potentialItems.filter(i => i.tags?.includes('renewable'));

        // Then we generate all non-renewable items.
        const nonRenewableItems = potentialItems.filter(i => !i.tags?.includes('renewable'));

        // Add the renewable items if the place doesn't already have them.
        renewableItems?.forEach(i => {
          if(!this.items.find(item => item.id === i.id)) {
            this.addItem(i);
          }
        });

        // Add random non-renewable items
        const randomItem = random(nonRenewableItems);
        // Make sure we don't add the same item twice.
        if(!this.items.find(item => item.id === randomItem.id)) {
          this.addItem(randomItem);
        }
        

      }
    }
  }

}

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(position) {
    return this.x === position.x && this.y === position.y;
  }

  add(direction) {
    return new Position(this.x + direction.x, this.y + direction.y);
  }

  distance(position) {
    return Math.sqrt(Math.pow(this.x - position.x, 2) + Math.pow(this.y - position.y, 2));
  }

}

class Direction {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static get NORTH() {
    return new Direction(0, -1);
  }

  static get SOUTH() {
    return new Direction(0, 1);
  }

  static get EAST() {
    return new Direction(1, 0);
  }

  static get WEST() {
    return new Direction(-1, 0);
  }

  /** @returns {string[]} */
  static get all() {
    return ["north", "south", "east", "west"];
  }
}

function generatePlace(position, type = generateRandomTag('biome')) {
  let place = new Place(position);
  
  // TODO: Create a random place type tag based on some rules.
  place.tags[0] = type;

  // Generate a settlement in the place
  // but only if there isn't a settlement in surrounding places.
  // ignore this if the place is the first place in the world.
  if (world.places.length > 0 && !isSettlementNearby(place) && Math.random() > 0.5) {
    generateSubplace(place);
  }

  // Generate a random number of items in the place.
  place.generateItems();

  // Add the place to the world.
  world.addPlace(place);

  // Let's also return the place.
  // This is used in the tests.
  return place;
}

function generateSubplace(place, type = generateRandomTag('settlement')) {
  const subplace = new Place(place.position);

  subplace.tags[0] = type;

  place.addPlace(subplace);
}

function isSettlementNearby(place) {
  const nearbyPlaces = world.places.filter(p => p.position.distance(place.position) < 5);
  return nearbyPlaces.some(p => p.tags.includes('settlement'));
}

function generateRandomTag(type) {
  const possibleTags = tags[type];
  const tag = possibleTags[Math.floor(Math.random() * possibleTags.length)];
  return tag;
}