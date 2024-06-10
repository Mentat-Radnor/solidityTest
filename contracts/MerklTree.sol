// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// Merkle Tree

contract Tree {
  bytes32[] public hashes;
  // H1 H2 H3 H4
  // TX1 TX2 TX3 TX4
  string[4] transactions = [
    "TX1: Sherlock -> Jonh",
    "TX2: Jonh -> Sherlock",
    "TX3: Sherlock -> Mary",
    "TX4: Mary -> Sherlock"
  ];

  constructor() {
    buildMerkleTree();
  }

  function buildMerkleTree() internal {
    for (uint i = 0; i < transactions.length; i++) {
        hashes.push(makeHash(transactions[i]));
    }

    buildMerkleTreeRecursive(0, transactions.length);
  }

  function buildMerkleTreeRecursive(uint offset, uint count) internal{
    if (count == 1) {
            return; // Достигли вершины дерева
        }

        uint newCount = 0;
        for (uint i = 0; i < count; i += 2) {
            if (i + 1 < count) {
                hashes.push(
                    keccak256(abi.encodePacked(hashes[offset + i], hashes[offset + i + 1]))
                );
            } else {
                hashes.push(hashes[offset + i]); // Обрабатываем нечетное количество элементов
            }
            newCount++;
        }

        buildMerkleTreeRecursive(offset + count, newCount);
  }

  function encode(string memory input) public pure returns(bytes memory) {
    return abi.encodePacked(input);
  }

  function makeHash(string memory input) public pure returns(bytes32) {
    return keccak256(
      encode(input)
    );
  }
  // 0xbc6d63022a4e7637813b2cebc53ae3c0d1f78a8b53a8a4d688f3651e870a7c65
  // 0x69a40d72d1258df801a7ae1e36dd586717a112334f8d9ca4664a339168874ef5
  // 0x36963ab7f84de329b0f58bea6237c5e47ec6e0b30252adfeddadc9846c342451

  function verify(string memory transaction, uint index, bytes32 root, bytes32[] memory proof) public pure returns(bool){
    bytes32 hash = makeHash(transaction);
    for(uint i = 0; i < proof.length; i++) {
      bytes32 element = proof[i];
      if (index % 2 == 0) {
        hash = keccak256(abi.encodePacked(hash, element));
      } else {
        hash = keccak256(abi.encodePacked(element, hash));
      }
      index = index / 2;
    }
    return hash == root;
  }
}