
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

type BuyHousePayoad = Record<{
    city: string;
    street: string;
    owner: string;
    price: number
}>

type InheritingHousePayoad = Record<{
    owner: string;
}>

const houseStorage = new StableBTreeMap<string, House>(0, 44, 1024);

$query;
export function getAllHouses(): Result<Vec<House>, string> {
    return Result.Ok(houseStorage.values());
}

$query;
export function getHousee(houseId: string): Result<House, string> {
    return match(houseStorage.get(houseId), {
        Some: (message) => Result.Ok<House, string>(message),
        None: () => Result.Err<House, string>(`a house with id=${houseId} not found`)
    });
}

$update;
export function addHouse(payload: BuyHousePayoad): Result<House, string> {
    const house: House = { id: uuidv4(), createdAt: ic.time(), updatedAt: ic.time(), ...payload };
    houseStorage.insert(house.id, house);
    return Result.Ok(house);
}


$update;
export function buyHouse(id: string, payload: BuyHousePayoad): Result<House, string> {
    return match(houseStorage.get(id), {
        Some: (message) => {
            const updatedMessage: House = { ...message, ...payload, updatedAt: ic.time() };
            houseStorage.insert(message.id, updatedMessage);
            return Result.Ok<House, string>(updatedMessage);
        },
        None: () => Result.Err<House, string>(`couldn't update a house with id=${id}. House not found!`)
    });
}

$update;
export function inheritHouse(id: string, payload: InheritingHousePayoad): Result<House, string> {
    return match(houseStorage.get(id), {
        Some: (message) => {
            const updatedMessage: House = { ...message, ...payload, price: null, updatedAt: ic.time() };
            houseStorage.insert(message.id, updatedMessage);
            return Result.Ok<House, string>(updatedMessage);
        },
        None: () => Result.Err<House, string>(`couldn't update a house with id=${id}. House not found!`)
    });
}

$update;
export function destroyHouse(id: string): Result<House, string> {
    return match(houseStorage.remove(id), {
        Some: (destroyHouse) => Result.Ok<House, string>(destroyHouse),
        None: () => Result.Err<House, string>(`couldn't destroy a message with id=${id}. message not found.`)
    });
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
