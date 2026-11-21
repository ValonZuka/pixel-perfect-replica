// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CertificateRegistry {
    struct CertificateRecord {
        bytes32 studentHash;
        uint64 completedAt;
        address issuer;
        bool exists;
    }

    address public immutable owner;
    mapping(bytes32 certificateId => CertificateRecord) private certificates;

    event CertificateAnchored(
        bytes32 indexed certificateId,
        bytes32 indexed studentHash,
        uint64 completedAt,
        address indexed issuer
    );

    error NotOwner();
    error InvalidCertificate();
    error AlreadyAnchored();

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function anchorCertificate(
        bytes32 certificateId,
        bytes32 studentHash,
        uint64 completedAt
    ) external onlyOwner {
        if (certificateId == bytes32(0) || studentHash == bytes32(0) || completedAt == 0) {
            revert InvalidCertificate();
        }
        if (certificates[certificateId].exists) revert AlreadyAnchored();

        certificates[certificateId] = CertificateRecord({
            studentHash: studentHash,
            completedAt: completedAt,
            issuer: msg.sender,
            exists: true
        });

        emit CertificateAnchored(certificateId, studentHash, completedAt, msg.sender);
    }

    function verifyCertificate(bytes32 certificateId)
        external
        view
        returns (CertificateRecord memory record)
    {
        return certificates[certificateId];
    }
}
