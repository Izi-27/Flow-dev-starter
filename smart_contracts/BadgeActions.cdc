import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448
import DeveloperBadges from "./develperbadge.cdc"

access(all) contract BadgeActions {

    // This function returns the Cadence code for a transaction that sets up a DeveloperBadges collection.
    // Wallets and other tools can call this function to get the transaction template.
    // This enables "Flow Actions", where a wallet can suggest this transaction to a user
    // if it detects they don't have a collection set up yet.
    access(all) fun getSetupCollectionAction(): String {
        return `
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews
import DeveloperBadges from 0xDeveloperBadges

transaction {
    prepare(signer: AuthAccount) {
        // Only setup a collection if one doesn't already exist.
        if signer.borrow<&DeveloperBadges.Collection>(from: DeveloperBadges.CollectionStoragePath) != nil {
            log("DeveloperBadges collection already exists.")
            return
        }

        // Create a new empty collection and save it to storage.
        let collection <- DeveloperBadges.createEmptyCollection()
        signer.save(<-collection, to: DeveloperBadges.CollectionStoragePath)

        // Create a public capability for the collection, exposing all necessary interfaces.
        signer.link<&DeveloperBadges.Collection{DeveloperBadges.DeveloperBadgesCollectionPublic, NonFungibleToken.CollectionPublic, NonFungibleToken.Receiver, MetadataViews.ResolverCollection}>(
            DeveloperBadges.CollectionPublicPath,
            target: DeveloperBadges.CollectionStoragePath
        )

        log("DeveloperBadges collection created successfully.")
    }
}
        `
    }
}