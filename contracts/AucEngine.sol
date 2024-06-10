// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract AucEngine {
  address public owner;
  // constant - значение можно задать только 1 раз
  //immutable - значение можно задать в конструкторе, но оно тоже неизменно
  uint constant DURATION = 2 days;
  // платежная такса
  uint constant FEE = 10; //10%

  struct Auction {
    address payable seller;
    uint startingPrice;
    uint finalPrice;
    uint startAt;
    uint endsAt;
    uint discountRate;
    string item;
    bool isStopped;
  }

  Auction[] public auctions;

  // Запись в журнале событий
  event AuctionCreated(uint index, string itemName, uint startingPrice, uint duration);

  constructor() {
    owner = msg.sender;
  }

  function createAuction(
    uint _startingPrice, uint _discountRate,string calldata _item, uint _duration
  ) external {
    uint duration = _duration == 0 ? DURATION : _duration;

    require(_startingPrice >=  _discountRate * duration, "incorrect starting price");

    Auction memory newAuction = Auction({
      seller: payable(msg.sender),
      startingPrice: _startingPrice,
      finalPrice: 0,
      discountRate: _discountRate,
      item: _item,
      startAt: block.timestamp, // now
      endsAt: block.timestamp + duration,
      isStopped: false
    });

    auctions.push(newAuction);

    emit AuctionCreated(auctions.length, _item, _startingPrice,  duration);
  }
}