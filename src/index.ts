// cannister code goes here
import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4, validate as isValidUUID } from 'uuid';

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

type InheritHousePayload = Record<{
    owner: string;
}>

const houseStorage = new StableBTreeMap<string, House>(0, 44, 1024);

$query;
export function getAllHouses(): Result<Vec<House>, string> {
    return Result.Ok(houseStorage.values());
}

$query;
export function getHouse(id: string): Result<House, string> {
    if (!isValidUUID(id)) {
        return Result.Err<House, string>("Please enter a valid House ID!");
    }

    return match(houseStorage.get(id), {
        Some: (house) => Result.Ok<House, string>(house),
        None: () => Result.Err<House, string>(`A house with ID ${id} was not found.`),
    });
}

$update;
export function addHouse(payload: BuyHousePayload): Result<House, string> {
    if (!payload.city || !payload.street || !payload.owner || payload.price < 0) {
        return Result.Err<House, string>("Invalid house data. Please provide valid data.");
    }

    const house: House = {
        id: uuidv4(),
        createdAt: ic.time(),
        updatedAt: ic.time(),
        ...payload,
    };
    houseStorage.insert(house.id, house);
    return Result.Ok(house);
}

$update;
export function buyHouse(id: string, payload: BuyHousePayload): Result<House, string> {
    if (!isValidUUID(id)) {
        return Result.Err<House, string>("Please enter a valid House ID!");
    }

    if (!payload.city || !payload.street || !payload.owner || payload.price < 0) {
        return Result.Err<House, string>("Invalid house data. Please provide valid data.");
    }

    return match(houseStorage.get(id), {
        Some: (house) => {
            const updatedHouse: House = {
                ...house,
                ...payload,
                updatedAt: ic.time(),
            };
            houseStorage.insert(house.id, updatedHouse);
            return Result.Ok<House, string>(updatedHouse);
        },
        None: () => Result.Err<House, string>(`A house with ID ${id} was not found.`),
    });
}

$update;
export function inheritHouse(id: string, payload: InheritHousePayload): Result<House, string> {
    if (!isValidUUID(id)) {
        return Result.Err<House, string>("Please enter a valid House ID!");
    }

    return match(houseStorage.get(id), {
        Some: (house) => {
            const updatedHouse: House = {
                ...house,
                ...payload,
                price: 0, // Set price to 0 when inheriting
                updatedAt: ic.time(),
            };
            houseStorage.insert(house.id, updatedHouse);
            return Result.Ok<House, string>(updatedHouse);
        },
        None: () => Result.Err<House, string>(`A house with ID ${id} was not found.`),
    });
}

$update;
export function destroyHouse(id: string): Result<House, string> {
    if (!isValidUUID(id)) {
        return Result.Err<House, string>("Please enter a valid House ID!");
    }

    return match(houseStorage.remove(id), {
        Some: (destroyedHouse) => Result.Ok<House, string>(destroyedHouse),
        None: () => Result.Err<House, string>(`A house with ID ${id} was not found.`),
    });
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
    }
}
