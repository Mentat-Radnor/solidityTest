// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// Не нужно создавать лишние переменные, так как контракт кодируется в байт код
contract Op {
    // не стоит модифицировтаь глобальную переменную. Их стоит перезаписывать 1 раз. в самом конце функции
    // Большые данные лучше хранит ьен в блокчейне, а хранить в облаке и использовтаь ссылки
    // не нужно 
    uint demo;
    uint128 a = 1;
    uint128 b = 1;
    uint256 c = 1;
    // bytes32 public hash = 0x9c22ff; // более оптимально сразу записать хэш хотя это харкод
    mapping(address => uint) payments;

    uint8[] testArray = [1,2,3] // будет стоит меньше чем просто безразмерный массив без указания байт
    // uint[] testArray2 = [1,2,3]

    function pay() external payable {
        require(msg.sender != address(0), "zero address");
        payments[msg.sender] = msg.value;
    }

    // В solidity не нужно дробить сильно функции из за того, что это увеличит количество газа ( хотя компиляторы могут решить данную проблему)
}

contract Un {
    uint demo = 0; // тут больше будет затрачено газа из за присвоения к 0
    uint128 a = 1;
    uint256 c = 1;
    uint128 b = 1;

    // bytes32 public hash = keccak256(
    //     abi.encodePacked("test")
    // );
    // mapping(address => uint) payments;
    uint[] payments; // Массивы более тяжеловесные в сравнении с mapping

    function pay() external payable {
        require(msg.sender != address(0), "zero address");
        payments.push(msg.value);
    }
}