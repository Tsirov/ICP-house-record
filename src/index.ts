// cannister code goes here
import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';

type House = Record<{
    id: string;
    city: string;
    owner: string;
    street: string;
    createdAt: nat64;
    updatedAt: nat64;
    price: number;
}>

type BuyHousePayload = Record<{
    city: string;
    street: string;
    owner: string;
    price: number;
}>

type InheritingHousePayload = Record<{
    owner: string;
}>

const houseStorage = new StableBTreeMap<string, House>(0, 44, 1024);

$query;
export function getAllHouses(): Result<Vec<House>, string> {
    return Result.Ok(houseStorage.values());
}

$query;
export function getHouse(houseId: string): Result<House, string> {
    const house = houseStorage.get(houseId);
    if (house !== null) {
        return Result.Ok(house);
    } else {
        return Result.Err(`A house with id=${houseId} not found`);
    }
}

$update;
export function addHouse(payload: BuyHousePayload): Result<House, string> {
    const house: House = { id: uuidv4(), createdAt: ic.time(), updatedAt: ic.time(), ...payload };
    houseStorage.insert(house.id, house);
    return Result.Ok(house);
}

$update;
export function buyHouse(id: string, payload: BuyHousePayload): Result<House, string> {
    const existingHouse = houseStorage.get(id);
    if (existingHouse !== null) {
        const updatedHouse: House = { ...existingHouse, ...payload, updatedAt: ic.time() };
        houseStorage.insert(id, updatedHouse);
        return Result.Ok(updatedHouse);
    } else {
        return Result.Err(`Couldn't update a house with id=${id}. House not found!`);
    }
}

$update;
export function inheritHouse(id: string, payload: InheritingHousePayload): Result<House, string> {
    const existingHouse = houseStorage.get(id);
    if (existingHouse !== null) {
        // Set price to a default value, e.g., zero
        const updatedHouse: House = { ...existingHouse, ...payload, price: 0, updatedAt: ic.time() };
        houseStorage.insert(id, updatedHouse);
        return Result.Ok(updatedHouse);
    } else {
        return Result.Err(`Couldn't update a house with id=${id}. House not found!`);
    }
}

$update;
export function destroyHouse(id: string): Result<House, string> {
    const destroyedHouse = houseStorage.remove(id);
    if (destroyedHouse !== null) {
        return Result.Ok(destroyedHouse);
    } else {
        return Result.Err(`Couldn't destroy a house with id=${id}. House not found.`);
    }
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32)

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256)
        }

        return array
    }
}
