import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448
import Crypto from 0x1d7e57aa55817448

access(all) contract DeveloperBadges: NonFungibleToken {

    access(all) var totalSupply: UInt64

    access(all) event ContractInitialized()
    access(all) event Withdraw(id: UInt64, from: Address?)
    access(all) event Deposit(id: UInt64, to: Address?)
    access(all) event BadgeMinted(id: UInt64, recipient: Address, name: String)

    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath
    access(all) let AdminStoragePath: StoragePath
    access(all) let MinterStoragePath: StoragePath
    access(all) let CollectionProviderPath: PrivatePath
    access(all) let MinterPublicPath: PublicPath

    // The public key of the backend service authorized to sign claim requests.
    // This is the raw public key, hex-encoded.
    access(all) var minterPublicKey: String
    // A dictionary to store nonces that have already been claimed to prevent replay attacks.
    access(all) var claimedNonces: {String: Bool}
    
    access(all) resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        access(all) let id: UInt64
        access(all) let name: String
        access(all) let description: String
        access(all) let thumbnail: String
        access(all) let awardedDate: UFix64

        init(
            id: UInt64,
            name: String,
            description: String,
            thumbnail: String
        ) {
            self.id = id
            self.name = name
            self.description = description
            self.thumbnail = thumbnail
            self.awardedDate = getCurrentBlock().timestamp
        }

        access(all) fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.ExternalURL>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>(),
                Type<MetadataViews.Serial>()
            ]
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: self.name,
                        description: self.description,
                        thumbnail: MetadataViews.HTTPFile(
                            url: self.thumbnail
                        )
                    )
                case Type<MetadataViews.Serial>():
                    return MetadataViews.Serial(
                        self.id
                    )
                case Type<MetadataViews.ExternalURL>():
                    // Example URL, can be customized
                    return MetadataViews.ExternalURL("https://flowdevkit.com/badges/".concat(self.id.toString()))
                case Type<MetadataViews.NFTCollectionData>():
                    return MetadataViews.NFTCollectionData(
                        storagePath: DeveloperBadges.CollectionStoragePath,
                        publicPath: DeveloperBadges.CollectionPublicPath,
                        providerPath: DeveloperBadges.CollectionProviderPath,
                        publicCollection: Type<&DeveloperBadges.Collection{NonFungibleToken.CollectionPublic}>(),
                        publicLinkedType: Type<&DeveloperBadges.Collection{DeveloperBadges.DeveloperBadgesCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(),
                        providerLinkedType: Type<&DeveloperBadges.Collection{NonFungibleToken.Provider, MetadataViews.ResolverCollection}>(),
                        createEmptyCollectionFunction: (fun (): @NonFungibleToken.Collection {
                            return <-DeveloperBadges.createEmptyCollection()
                        })
                    )
                case Type<MetadataViews.NFTCollectionDisplay>():
                    let media = MetadataViews.Media(
                        file: MetadataViews.HTTPFile(
                            url: "https://flowdevkit.com/badge-collection-logo.png" // Placeholder
                        ),
                        mediaType: "image/png"
                    )
                    return MetadataViews.NFTCollectionDisplay(
                        name: "Developer Badges",
                        description: "A collection of badges awarded to developers by FlowDevKit.",
                        externalURL: MetadataViews.ExternalURL("https://flowdevkit.com/badges"),
                        squareImage: media,
                        bannerImage: media,
                        socials: {}
                    )
            }
            return nil
        }
    }

    access(all) resource interface DeveloperBadgesCollectionPublic {
        fun deposit(token: @NonFungibleToken.NFT)
        fun getIDs(): [UInt64]
        fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
    }

    access(all) resource Collection: DeveloperBadgesCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        access(all) var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init () {
            self.ownedNFTs <- {}
        }

        access(all) fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        access(all) fun deposit(token: @NonFungibleToken.NFT) {
            let badge <- token as! @DeveloperBadges.NFT
            let id: UInt64 = badge.id
            let oldToken <- self.ownedNFTs[id] <- badge
            emit Deposit(id: id, to: self.owner?.address)
            destroy oldToken
        }

        access(all) fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        access(all) fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        access(all) fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let badge = nft as! &DeveloperBadges.NFT
            return badge as &AnyResource{MetadataViews.Resolver}
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    access(all) fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    // This private function contains the core logic for creating a new NFT.
    // It's called by both the Admin resource and the PublicMinter resource.
    access(contract) fun mint(
        recipient: &{NonFungibleToken.Receiver},
        name: String,
        description: String,
        thumbnail: String
    ): @NFT {
        var newBadge <- create NFT(
            id: self.totalSupply,
            name: name,
            description: description,
            thumbnail: thumbnail
        )

        emit BadgeMinted(
            id: newBadge.id,
            recipient: recipient.owner!.address,
            name: name
        )

        self.totalSupply = self.totalSupply + UInt64(1)

        return <-newBadge
    }

    // The PublicMinter resource allows anyone to claim a badge if they provide a valid signature from the backend service.
    // This enables a "gasless" claiming experience where a service can pay for the transaction on behalf of the user.
    access(all) resource PublicMinter {
        // claimBadge verifies a signature and mints a badge if the signature is valid.
        //
        // Parameters:
        // - recipient: A capability to the user's collection where the badge will be deposited.
        // - name, description, thumbnail: The metadata for the badge being claimed.
        // - nonce: A unique string for this claim to prevent replay attacks.
        // - signature: A hex-encoded signature of the badge metadata and nonce, signed by the minter's private key.
        access(all) fun claimBadge(
            recipient: Capability<&{NonFungibleToken.Receiver}>,
            name: String,
            description: String,
            thumbnail: String,
            nonce: String,
            signature: String
        ) {
            pre {
                DeveloperBadges.minterPublicKey.length > 0: "Minter public key has not been set by the admin."
                DeveloperBadges.claimedNonces[nonce] == nil: "This claim has already been processed."
            }

            let key = Crypto.PublicKey(
                publicKey: DeveloperBadges.minterPublicKey.decodeHex(),
                signatureAlgorithm: SignatureAlgorithm.ECDSA_P256
            )

            // The message that was signed by the backend is the concatenation of the badge metadata and the nonce.
            let signedData = name.concat(description).concat(thumbnail).concat(nonce).utf8

            let signatureBytes = signature.decodeHex()

            // Verify the signature against the data. The domain separation tag ensures the signature is unique to this action.
            let isValid = key.verify(
                signature: signatureBytes,
                signedData: signedData,
                domainSeparationTag: "BADGE-CLAIM-V1",
                hashAlgorithm: HashAlgorithm.SHA3_256
            )

            if !isValid {
                panic("Invalid signature for badge claim")
            }

            // Mark the nonce as used to prevent this claim from being processed again.
            DeveloperBadges.claimedNonces[nonce] = true

            let recipientRef = recipient.borrow() ?? panic("Could not borrow recipient capability")

            let newBadge <- DeveloperBadges.mint(recipient: recipientRef, name: name, description: description, thumbnail: thumbnail)

            recipientRef.deposit(token: <-newBadge)
        }
    }

    access(all) resource Admin {
        // mintBadge allows an admin to directly airdrop a badge to a user's collection.
        access(all) fun mintBadge(
            recipient: &{NonFungibleToken.Receiver},
            name: String,
            description: String,
            thumbnail: String
        ) {
            let newBadge <- DeveloperBadges.mint(recipient: recipient, name: name, description: description, thumbnail: thumbnail)
            recipient.deposit(token: <-newBadge)
        }

        // setMinterPublicKey allows the admin to set or rotate the public key used for verifying claim signatures.
        access(all) fun setMinterPublicKey(publicKey: String) {
            DeveloperBadges.minterPublicKey = publicKey
        }
    }

    init() {
        self.totalSupply = 0
        self.CollectionStoragePath = /storage/developerBadgesCollection
        self.CollectionPublicPath = /public/developerBadgesCollection
        self.AdminStoragePath = /storage/developerBadgesAdmin
        self.MinterStoragePath = /storage/developerBadgesMinter
        self.CollectionProviderPath = /private/developerBadgesCollectionProvider
        self.MinterPublicPath = /public/developerBadgesMinter

        self.minterPublicKey = ""
        self.claimedNonces = {}

        let admin <- create Admin()
        self.account.save(<-admin, to: self.AdminStoragePath)

        // Create a PublicMinter resource and save it to the account's storage.
        let minter <- create PublicMinter()
        self.account.save(<-minter, to: self.MinterStoragePath)

        // Link the PublicMinter resource to a public path so that anyone can access it.
        self.account.link<&DeveloperBadges.PublicMinter>(self.MinterPublicPath, target: self.MinterStoragePath)

        emit ContractInitialized()
    }
}
