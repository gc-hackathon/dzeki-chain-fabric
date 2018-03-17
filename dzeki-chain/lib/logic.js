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
  