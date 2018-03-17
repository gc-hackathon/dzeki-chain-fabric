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
    
    if (buyDog.discount != null && buyDog.discount.amount <= dogPrice) {
        dogPrice -= buyDog.discount.amount;
    }
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