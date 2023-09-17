// cannister code goes here
import {
  $query,
  $update,
  Record,
  StableBTreeMap,
  Vec,
  match,
  Result,
  nat64,
  ic,
  Opt,
} from "azle";
import { v4 as uuidv4 } from "uuid";

type House = Record<{
  id: string;
  city: string;
  owner: string;
  street: string;
  createdAt: nat64;
  updatedAt: nat64;
  price: number;
}>;

type BuyHousePayoad = Record<{
  city: string;
  street: string;
  owner: string;
  price: number;
}>;

type InheritingHousePayoad = Record<{
  owner: string;
}>;

const houseStorage = new StableBTreeMap<string, House>(0, 44, 1024);

$query;
export function getAllHouses(): Result<Vec<House>, string> {
  try {
    return Result.Ok(houseStorage.values());
  } catch (error) {
    return Result.Err(`Error occurred while fetching all houses: ${error}`);
  }
}

$query;
export function getHouseById(houseId: string): Result<House, string> {
  if (typeof houseId !== "string") {
    return Result.Err<House, string>("Invalid houseId");
  }
  return match(houseStorage.get(houseId), {
    Some: (message) => Result.Ok<House, string>(message),
    None: () =>
      Result.Err<House, string>(
        `No house found with the provided id: ${houseId}`
      ),
  });
}

$update;
export function addHouse(payload: BuyHousePayoad): Result<House, string> {
  // Validate the payload before processing it
  if (!payload.city) {
    return Result.Err<House, string>("City is required");
  }
  if (!payload.street) {
    return Result.Err<House, string>("Street is required");
  }
  if (!payload.owner) {
    return Result.Err<House, string>("Owner is required");
  }
  if (!payload.price) {
    return Result.Err<House, string>("Price is required");
  }
  if (payload.price <= 0) {
    return Result.Err<House, string>(
      "Invalid price. Price must be greater than 0."
    );
  }

  const house: House = {
    id: uuidv4(),
    createdAt: ic.time(),
    updatedAt: ic.time(),
    city: payload.city,
    street: payload.street,
    owner: payload.owner,
    price: payload.price,
  };


  try {
    // Update the house in the houseStorage;
    houseStorage.insert(house.id, house);
    return Result.Ok<House, string>(house);
  } catch (error) {
    return Result.Err<House, string>("Failed to insert house into storage");
  }
}

$update;
export function buyHouse(
  id: string,
  payload: BuyHousePayoad
): Result<House, string> {
  // Validate the payload before processing it
  if (!payload.city) {
    return Result.Err<House, string>("City is required");
  }
  if (!payload.street) {
    return Result.Err<House, string>("Street is required");
  }
  if (!payload.owner) {
    return Result.Err<House, string>("Owner is required");
  }
  if (!payload.price) {
    return Result.Err<House, string>("Price is required");
  }

  if (payload.price <= 0) {
    return Result.Err<House, string>(
      "Invalid price. Price must be greater than 0."
    );
  }

  return match(houseStorage.get(id), {
    Some: (message) => {
      if (message.owner !== payload.owner) {
        return Result.Err<House, string>(
          "Only the current owner can sell the house"
        );
      }
      const updatedMessage: House = {
        ...message,
        ...payload,
        updatedAt: ic.time(),
      };
      houseStorage.insert(message.id, updatedMessage);
      return Result.Ok<House, string>(updatedMessage);
    },
    None: () =>
      Result.Err<House, string>(
        `couldn't update a house with id=${id}. House not found!`
      ),
  });
}

$update;
export function inheritHouse(
  id: string,
  payload: InheritingHousePayoad
): Result<House, string> {
  // Validate the payload before processing it
  if (!payload.owner) {
    return Result.Err<House, string>("Invalid payload: owner is required");
  }

  const ownerExists = houseStorage
    .values()
    .some((house) => house.owner === payload.owner);
  if (!ownerExists) {
    return Result.Err<House, string>(
      `Owner '${payload.owner}' does not exist in the system.`
    );
  }

  return match(houseStorage.get(id), {
    Some: (message) => {
      const updatedMessage: House = {
        ...message,
        owner: payload.owner,
        updatedAt: ic.time(),
      };
      houseStorage.insert(message.id, updatedMessage);
      return Result.Ok<House, string>(updatedMessage);
    },
    None: () =>
      Result.Err<House, string>(
        `couldn't update a house with id=${id}. The house with id=${id} does not exist!`
      ),
  });
}

$update;
export function removeHouse(id: string): Result<House, string> {
  try {
    return match(houseStorage.remove(id), {
      Some: (removedHouse) => Result.Ok<House, string>(removedHouse),
      None: () =>
        Result.Err<House, string>(
          `couldn't remove a house with id=${id}. House not found.`
        ),
    });
  } catch (error) {
    return Result.Err<House, string>(
      `An error occurred while removing the house: ${error}`
    );
  }
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
  // @ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);

    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }

    return array;
  },
};
