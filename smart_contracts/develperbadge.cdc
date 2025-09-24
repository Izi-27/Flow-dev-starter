import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448

access(all) contract DeveloperBadges: NonFungibleToken {

    access(all) var totalSupply: UInt64

    access(all) event ContractInitialized()
    access(all) event Withdraw(id: UInt64, from: Address?)
    access(all) event Deposit(id: UInt64, to: Address?)
    access(all) event BadgeMinted(id: UInt64, recipient: Address, name: String)

    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath
    access(all) let AdminStoragePath: StoragePath

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
                        providerPath: /private/developerBadgesCollection,
                        publicCollection: Type<&DeveloperBadges.Collection{DeveloperBadges.DeveloperBadgesCollectionPublic}>(),
                        publicLinkedType: Type<&DeveloperBadges.Collection{DeveloperBadges.DeveloperBadgesCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(),
                        providerLinkedType: Type<&DeveloperBadges.Collection{DeveloperBadges.DeveloperBadgesCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Provider, MetadataViews.ResolverCollection}>(),
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

    access(all) resource Admin {
        access(all) fun mintBadge(
            recipient: &{NonFungibleToken.CollectionPublic},
            name: String,
            description: String,
            thumbnail: String
        ) {
            var newBadge <- create NFT(
                id: DeveloperBadges.totalSupply,
                name: name,
                description: description,
                thumbnail: thumbnail
            )

            emit BadgeMinted(
                id: newBadge.id,
                recipient: recipient.owner!.address,
                name: name
            )

            recipient.deposit(token: <-newBadge)

            DeveloperBadges.totalSupply = DeveloperBadges.totalSupply + UInt64(1)
        }
    }

    init() {
        self.totalSupply = 0
        self.CollectionStoragePath = /storage/developerBadgesCollection
        self.CollectionPublicPath = /public/developerBadgesCollection
        self.AdminStoragePath = /storage/developerBadgesAdmin

        let admin <- create Admin()
        self.account.save(<-admin, to: self.AdminStoragePath)

        emit ContractInitialized()
    }
}
