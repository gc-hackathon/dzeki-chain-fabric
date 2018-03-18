/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Buy dog.
 * @transaction
 * @param {org.acme.mynetwork.BuyDog} buyDog - The BuyDog instance.
 */
function dogBuying(buyDog) {
  
  // validations
  if (buyDog.buyer == buyDog.seller) {
      throw new Error('Buyer is the same as seller!');
  }
  if (buyDog.buyer == buyDog.dog.owner) {
      throw new Error('You cannot buy your own dog!');
  }
  if (!buyDog.dog.forSale) {
    throw new Error('This dog is not for sale!');
  }
  
  var dogPrice = buyDog.dog.price;
  dogPrice = checkDiscountBuy(buyDog, dogPrice);
  
  if (dogPrice > buyDog.buyer.balance) {
    throw new Error('Insufficient funds!');
  }
  
  buyDog.buyer.balance -= dogPrice;
  buyDog.seller.balance += dogPrice;
  
  buyDog.dog.owner = buyDog.buyer;
  buyDog.dog.forSale = false;
  
  //  update ledger
  return getAssetRegistry('org.acme.mynetwork.Dog')
      .then(function (assetRegistry) {
          return assetRegistry.update(buyDog.dog);
      })
    .then(function () {
          return getParticipantRegistry('org.acme.mynetwork.BreedingHouse');
      })
      .then(function (participantRegistry) {
          return participantRegistry.update(buyDog.seller);
      })
      .then(function () {
          return getParticipantRegistry('org.acme.mynetwork.BreedingHouse');
      })
      .then(function (participantRegistry) {
          return participantRegistry.update(buyDog.buyer);
      });
}

/**
 * Buy mating with dog.
 * @transaction
 * @param {org.acme.mynetwork.MatingRequest} matingRequest - The MatingRequest instance.
 */
function requestMating(matingRequest) {
  
  var chosenDog = matingRequest.chosenDog;
  var ownedDog = matingRequest.ownedDog;
  
  if (chosenDog.gender == ownedDog.gender) {
      throw new Error('Sorry, no gay dogs allowed.');
  }
  
  if (matingRequest.money == true) {
    var matePrice = chosenDog.price;
      if (chosenDog.gender == 'male') {
          matePrice = checkDiscountMate(matingRequest, matePrice);
          matingRequest.chosenDog.owner.balance += matePrice;
        matingRequest.ownedDog.owner.balance -= matePrice;
    } else {
        matePrice = ownedDog.price;
        matePrice = checkDiscountMate(matingRequest, matePrice);
          matingRequest.chosenDog.owner.balance -= matePrice;
        matingRequest.ownedDog.owner.balance += matePrice;
    }
  }
  
  return getParticipantRegistry('org.acme.mynetwork.BreedingHouse')
      .then(function (participantRegistry) {
          return participantRegistry.update(matingRequest.ownedDog.owner);
      })
      .then(function () {
          return getParticipantRegistry('org.acme.mynetwork.BreedingHouse');
      })
      .then(function (participantRegistry) {
          return participantRegistry.update(matingRequest.chosenDog.owner);
      });
  
}

var checkDiscountBuy = function(buyDog, dogPrice) {
  if (buyDog.discount != null) {
    var discountAmount = buyDog.discount.amount;
    var discountBuyer = buyDog.discount.buyer;
    var discountSeller = buyDog.discount.seller;
    
    if (buyDog.buyer == discountBuyer || buyDog.buyer == discountSeller) {
      if (buyDog.seller == discountBuyer || buyDog.seller == discountSeller) {
        if (discountAmount <= dogPrice) {
          dogPrice -= discountAmount;
        }
      }
    }
  }
  
  return dogPrice;
}

var checkDiscountMate = function(matingRequest, matePrice) {
  if (matingRequest.discount != null) {
    var buyer = matingRequest.ownedDog.owner;
    var seller = matingRequest.chosenDog.owner;
    var discountBuyer = matingRequest.discount.buyer;
    var discountSeller = matingRequest.discount.seller;
    var discountAmount = matingRequest.discount.amount;
    
    if (buyer == discountBuyer || buyer == discountSeller) {
      if (seller == discountBuyer || seller == discountSeller) {
        if (discountAmount <= matePrice) {
          matePrice -= discountAmount;
        }
      }
    }
  }
  
  return matePrice;
}



/**
 * Swap dogs from one house to another.
 * @transaction
 * @param {org.acme.mynetwork.SwapOwners} swapObj - The SwapOwners instance.
 */
function swapOwners(swapObj) {
  var tempOwner1 = swapObj.dog1.owner;
  swapObj.dog1.owner = swapObj.dog2.owner;
  swapObj.dog2.owner = tempOwner1;
  
  return getAssetRegistry('org.acme.mynetwork.Dog')
      .then(function (assetRegistry) {
          return assetRegistry.update(swapObj.dog1);
      })
    .then(function () {
          return getAssetRegistry('org.acme.mynetwork.Dog');
      })
      .then(function (assetRegistry) {
          return assetRegistry.update(swapObj.dog2);
      });
  
}

/**
 * Change dog for sale field.
 * @transaction
 * @param {org.acme.mynetwork.UpdateDog} updateDog - The UpdateDog instance.
 */
function dogUpdate(updateDog) {
  updateDog.dog.forSale = updateDog.forSale;
  
  return getAssetRegistry('org.acme.mynetwork.Dog')
      .then(function (assetRegistry) {
          return assetRegistry.update(updateDog.dog);
      });
  
}


/**
 * Add breeding houses
 * @transaction
 * @param {org.acme.mynetwork.SetupBreedingHouses} setupBreedingHouses
 */
function setupBreedingHouses() {
  
  var factory = getFactory();
  var NS = 'org.acme.mynetwork';

  // Create Breeding Houses
  var bh1 = factory.newResource(NS, 'BreedingHouse', 'BH_1');
  bh1.name = 'Daniel Elero BH';
  bh1.address = 'StartIT 1, Novi Sad, Serbia';
  bh1.phone = '421492';
  bh1.email = 'debh@bh.com';
  bh1.balance = 65000
  
  var bh2 = factory.newResource(NS, 'BreedingHouse', 'BH_2');
  bh2.name = 'Milan Sovic BH';
  bh2.address = 'StartIT 2, Novi Sad, Serbia';
  bh2.phone = '98989986';
  bh2.email = 'msbh@bh.com';
  bh2.balance = 53200

  var bh3 = factory.newResource(NS, 'BreedingHouse', 'BH_3');
  bh3.name = 'Aleksandar Andjelkovic BH';
  bh3.address = 'StartIT 3, Novi Sad, Serbia';
  bh3.phone = '292929292';
  bh3.email = 'aabh@bh.com';
  bh3.balance = 200

  var bh4 = factory.newResource(NS, 'BreedingHouse', 'BH_4');
  bh4.name = 'Aleksandar Okiljevic BH';
  bh4.address = 'StartIT 4, Novi Sad, Serbia';
  bh4.phone = '12121241';
  bh4.email = 'aobh@bh.com';
  bh4.balance = 10

  // Save
  return getParticipantRegistry(NS + '.BreedingHouse')
      .then(function(breedingHouseRegistry) {
          return breedingHouseRegistry.addAll([bh1, bh2, bh3, bh4]);
      });
}


/**
 * Create dogs
 * @transaction
 * @param {org.acme.mynetwork.SetupDogs} setupDogs
 */
function setupDogs() {
  
  var factory = getFactory();
  var NS = 'org.acme.mynetwork';

  // Create Dogs
  var dog1 = factory.newResource(NS, 'Dog', 'D_1');
  dog1.name = "Dzeki";
  dog1.price = 0;
  dog1.breed = "Mixed";
  dog1.gender = "male";
  dog1.info = "Dzeki is the CEO of Dzeki-Chain platform. He is not interested. . .";
  dog1.forSale = false;
  dog1.forMate = false;
  dog1.photoUrl = "";
  dog1.owner = factory.newRelationship(NS, 'BreedingHouse', 'BH_1');

  var dog2 = factory.newResource(NS, 'Dog', 'D_2');
  dog2.name = "Charlie";
  dog2.price = 500;
  dog2.breed = "Zlatni Retriver";
  dog2.gender = "male";
  dog2.info = "Charlie made 32 puppies!";
  dog2.forSale = false;
  dog2.forMate = true;
  dog2.photoUrl = "";
  dog2.owner = factory.newRelationship(NS, 'BreedingHouse', 'BH_3');

  var dog3 = factory.newResource(NS, 'Dog', 'D_3');
  dog3.name = "Cooper";
  dog3.price = 800;
  dog3.breed = "Haski";
  dog3.gender = "male";
  dog3.info = "Cooper is the fastest dog on platform";
  dog3.forSale = true;
  dog3.forMate = false;
  dog3.photoUrl = "";
  dog3.owner = factory.newRelationship(NS, 'BreedingHouse', 'BH_2');


  var dog4 = factory.newResource(NS, 'Dog', 'D_4');
  dog4.name = "Max";
  dog4.price = 0;
  dog4.breed = "Haski";
  dog4.gender = "male";
  dog4.info = "Max is not for sale and not in the mood";
  dog4.forSale = false;
  dog4.forMate = false;
  dog4.photoUrl = "";
  dog4.owner = factory.newRelationship(NS, 'BreedingHouse', 'BH_2');


  var dog5 = factory.newResource(NS, 'Dog', 'D_5');
  dog5.name = "Bella";
  dog5.price = 500;
  dog5.breed = "Zlatni Retriver";
  dog5.gender = "female";
  dog5.info = "Mia bella. . . . ";
  dog5.forSale = false;
  dog5.forMate = true;
  dog5.photoUrl = "";
  dog5.owner = factory.newRelationship(NS, 'BreedingHouse', 'BH_4');

  var dog6 = factory.newResource(NS, 'Dog', 'D_6');
  dog6.name = "Lucy";
  dog6.price = 200;
  dog6.breed = "Haski";
  dog6.gender = "female";
  dog6.info = "Lucika je dresirana";
  dog6.forSale = true;
  dog6.forMate = false;
  dog6.photoUrl = "";
  dog6.owner = factory.newRelationship(NS, 'BreedingHouse', 'BH_3');

  var dog7 = factory.newResource(NS, 'Dog', 'D_7');
  dog7.name = "Luna";
  dog7.price = 10000;
  dog7.breed = "Maltezer";
  dog7.gender = "female";
  dog7.info = "Luna je najskuplja na platformi";
  dog7.forSale = true;
  dog7.forMate = false;
  dog7.photoUrl = "";
  dog7.owner = factory.newRelationship(NS, 'BreedingHouse', 'BH_3');
  dog7.father = factory.newRelationship(NS, 'Dog', 'D_10');
  dog7.mother = factory.newRelationship(NS, 'Dog', 'D_9');

  var dog8 = factory.newResource(NS, 'Dog', 'D_8');
  dog8.name = "Molly";
  dog8.price = 350;
  dog8.breed = "Zlatni Retreiver";
  dog8.gender = "female";
  dog8.info = "Aw aw aw aw";
  dog8.forSale = true;
  dog8.forMate = true;
  dog8.photoUrl = "";
  dog8.owner = factory.newRelationship(NS, 'BreedingHouse', 'BH_4');
  dog8.father =  factory.newRelationship(NS, 'Dog', 'D_2');
  dog8.mother =  factory.newRelationship(NS, 'Dog', 'D_5');

  var dog9 = factory.newResource(NS, 'Dog', 'D_9');
  dog9.name = "Maggie";
  dog9.price = 220;
  dog9.breed = "Maltezer";
  dog9.gender = "female";
  dog9.info = "Maggie from the Simpsons";
  dog9.forSale = true;
  dog9.forMate = true;
  dog9.photoUrl = "";
  dog9.owner = factory.newRelationship(NS, 'BreedingHouse', 'BH_4');

  var dog10 = factory.newResource(NS, 'Dog', 'D_10');
  dog10.name = "Svrca";
  dog10.price = 3200;
  dog10.breed = "Maltezer";
  dog10.gender = "male";
  dog10.info = "Svrcaaaaa";
  dog10.forSale = false;
  dog10.forMate = true;
  dog10.photoUrl = "";
  dog10.owner = factory.newRelationship(NS, 'BreedingHouse', 'BH_1');

  var dog11 = factory.newResource(NS, 'Dog', 'D_11');
  dog11.name = "Dzek";
  dog11.price = 1220;
  dog11.breed = "Maltezer";
  dog11.gender = "male";
  dog11.info = "Svrcaaaaa";
  dog11.forSale = false;
  dog11.forMate = true;
  dog11.photoUrl = "";
  dog11.owner = factory.newRelationship(NS, 'BreedingHouse', 'BH_1');
  dog11.father = factory.newRelationship(NS, 'Dog', 'D_2');
  dog11.mother =  factory.newRelationship(NS, 'Dog', 'D_5');

  var dog12 = factory.newResource(NS, 'Dog', 'D_12');
  dog12.name = "Violina";
  dog12.price = 2450;
  dog12.breed = "Maltezer";
  dog12.gender = "female";
  dog12.info = "Bla bla bla bla bla";
  dog12.forSale = false;
  dog12.forMate = true;
  dog12.photoUrl = "";
  dog12.owner = factory.newRelationship(NS, 'BreedingHouse', 'BH_1');
  dog12.father = factory.newRelationship(NS, 'Dog', 'D_11');
  dog12.mother = factory.newRelationship(NS, 'Dog', 'D_7');
  
   return getAssetRegistry(NS + '.Dog')
    .then(function(dogRegistry){
      return dogRegistry.addAll([dog1, dog2, dog3, dog4, dog5, dog6, dog7, dog8, dog9, dog10, dog11, dog12]);  
    });
}


/**
 * Change dog for sale field.
 * @transaction
 * @param {org.acme.mynetwork.SetupDiscounts} setupDiscounts
 */
function setupDiscounts() {
  var factory = getFactory();
  var NS = 'org.acme.mynetwork';
  
  var disc1 = factory.newResource(NS, 'Discount', 'DISC_1');
  
  disc1.buyer = factory.newRelationship(NS, 'BreedingHouse', 'BH_1');
  disc1.seller = factory.newRelationship(NS, 'BreedingHouse', 'BH_2');
  disc1.amount = 10;
  
  // Save
  return getAssetRegistry(NS + '.Discount')
    .then(function(discountRegistry) {      	
      return discountRegistry.addAll([disc1]);
    });
}


