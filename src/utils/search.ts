import { Location, MenuItem } from "../types/models";

function findLocationById(locations: Location[], id: string): Location | null {
  for (const location of locations) {
    if (location.id === id) return location;
  }
  return null;
}

function findMenuItemByName(items: MenuItem[], name: string): MenuItem | null {
  const targetName = name.toLowerCase();
  for (const item of items) {
    if (item.name.toLowerCase() === targetName) return item;
  }
  return null;
}

function binarySearchLocationByCapacity(
  sortedLocations: Location[],
  targetCapacity: number
): number {
  let low = 0;
  let high = sortedLocations.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midCapacity = sortedLocations[mid].seatingCapacity;

    if (midCapacity === targetCapacity) {
      return mid;
    } else if (midCapacity < targetCapacity) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}

export { findLocationById, findMenuItemByName, binarySearchLocationByCapacity };