/** Action class that is constructed from the json data. */
class Action {
  constructor(data) {
    this.type = data.type;
    this.conditions = data.conditions;
    this.verbs = data.verbs;

    /** @type {Argument[]} */
    this.arguments = data.arguments.map(arg => new Argument(arg));
    
    this.errors = data.errors;
  }

  /**
   * Check if the action can be executed.
   * @param {string[]} args the arguments to the action
   * @returns {string} Returns an error message from actions errors, or null if the action can be executed.
   */
  canExecute(args) {
    
    if(args.length > 0) {
      // If the action needs arguments, then check if the given arguments
      // are valid.
      
      for(let i = 0; i < args.length; i++) {
        let arg = args[i];
        let argData = this.arguments[i];
        if(!argData.isValid(arg)) {
          return arg + this.errors['invalid-argument'];
        }
      }
      
    } else if (args.length === 0 && this.conditions['needs-arguments']) {
      // If there are no arguments and the action needs arguments, 
      // then return the error message for the missing arguments
      return this.errors['missing-arguments'];
    } else {
      // If there are no arguments and the action doesn't need arguments,
      // then return null, which means the action can be executed.
      return null;
    }
  }

    
}

const ArgumentTypes = {
  "string": {
    isValid(value) {
      // If the value is a string, then it is valid
      return typeof value === "string";
    }
  },
  "direction": {
    isValid(value) {
      // If the value is a direction, then it is valid
      return value === "north" || value === "south" || value === "east" || value === "west";
    }
  },
  "place": {
    isValid(value) {
      // If the value is a places name, then it is valid
      // For now, check allow only if the place exists in the players
      // current position place.
      const place = world.getPlaceAt(player.position);
      return place.findPlace(value) != null;
    }
  },
  "item": {
    isValid(value) {
      // If the value is an item name, then it is valid
      const place = player.location || world.getPlaceAt(player.position);
      const item = place.findItem(value) || player.findItem(value);
      console.log(item);
      return item != null;
    }
  },
};

class Argument {
  constructor(data) {
    this.type = data.type;
    this.optional = data.optional;
  }

  /**
   * Check if the argument is valid.
   * @param {string} value value to check
   */
  isValid(value) {
    return ArgumentTypes[this.type].isValid(value);
  }
}