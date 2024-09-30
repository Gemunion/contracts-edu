// SPDX-License-Identifier: UNLICENSED

// Author: TrejGun
// Email: trejgun+opensource@gmail.com
// Website: https://ethberry.io/

pragma solidity ^0.8.20;

// Diamond
error FunctionDoesNotExist();

// DiamonInit
error DiamondAlreadyInitialised();

// DiamondLib
error MustBeContractOwner();
error IncorrectFacetCutAction();
error NoSelectorsInFacet();
error AddFacetCantBeAddressZero();
error FunctionAlreadyExists();
error ReplaceFacetCantBeAddressZero();
error ReplaceFunctionWithSameFunction();
error RemoveFacetAddressMustBeAddressZero();
error CantRemoveFunctionThatDoesntExist();
error CantRemoveImmutableFunction();
error FacetHasNoCode();
