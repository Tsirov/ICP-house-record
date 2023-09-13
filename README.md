# Canister Documentation

## Overview

The house sistem provide when some house is builded to register the house, and after some time then some one can buy it or inherit it.

## Data Structures

### House

- **id:** A unique identifier for the house.
- **city:** The city wrehe is located the house.
- **street:** The streed address.
- **owner:** A owner of the house.
- **createdAt:** When the house is created.
- **UpdatedAt:** The last updated information about the house.
- **price:** A price of the house.

## Functions

### Courses

- **addHouse(city, street, owner, price)**
  - Adds a new house to the record.
  - Returns the created house or an error message.
  
- **getAllHouses()**
  - Retrieves all houses from the record.
  - Returns a list of houses.
  
- **getHousee(houseId)**
  - Searching for a specific house based on its houseId.
  - Returns the requested house or an error message.

- **buyHouse(id, city, street, owner, price)**
  - Buy a given house at a certain price.
  - Returns the updated house or an error message.
  
- **inheritHouse(id, owner)**
  - Inherit house without needing to buy it.
  - Returns the updated house or an error message.
  
- **destroyHouse(id)**
  - Remove house from record.
  - Returns a deleted house or an error message.

## Execution

### Steps to Test

1. Clone the Repository

2. Navigate to the Project Directory

3. Install Dependencies

```npm install```

4. Start the ICP Blockchain Locally & Deploy the Canister

```
dfx start --background --clean
dfx deploy
```
