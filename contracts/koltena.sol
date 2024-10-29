// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

interface fnft {
    // Get info
    function balanceOfBatch(
        address[] calldata _owners,
        uint256[] calldata _ids
    ) external view returns (uint256[] memory);

    function assetOwners(
        uint256 tokenId
    ) external view returns (address[] memory);

    function assetSupply(uint256 assetId) external view returns (uint256);

    function assetsCreated() external view returns (uint256[] memory);

    function balanceOf(
        address account,
        uint256 id
    ) external view returns (uint256);

    function addressAssets(
        address owner
    ) external view returns (uint256[] memory);

    // F-NFT

    function mint(uint256 numTokens) external returns (uint256);

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _id,
        uint256 _value,
        bytes calldata _data
    ) external;

    function approval(
        address operator,
        uint256 tokenId,
        uint256 value
    ) external returns (bool);

    function setApprovalForAll(address _operator, bool _approved) external;

    function setUri(uint256 _tokenId, string calldata uri_) external;

    // Sale System

    function proposePurchase(
        address seller,
        uint256 assetId,
        uint256 numTokens,
        uint256 ethValue
    ) external;

    function approveSale(
        address buyer,
        uint256 assetId,
        uint256 numTokens,
        uint256 ethValue
    ) external;

    function confirmSale(uint256 assetId, address buyer) external;

    function finishTransaction(
        address seller,
        uint256 assetId
    ) external payable;

    // Voting System

    function activateEvent(uint256 assetId) external returns (uint32);

    function finishEvent(uint32 eventId) external;

    function vote(uint32 eventId, uint32 option) external;

    function getPoll(
        uint32 eventId
    ) external view returns (address, bool, uint32, uint32, uint256);

    function getVoterDecision(
        uint32 eventId,
        address voter
    ) external view returns (bool, uint32);

    function getEventDecisions(
        uint32 eventId
    )
        external
        view
        returns (
            uint256 votedNull,
            uint256 votedAbstained,
            uint256 voteNo,
            uint256 votedYes
        );

    function getEventStatus() external view returns (string[] memory);
}
