/**
 * Collection Creation and Management
 * 
 * This module handles Metaplex collection creation, verification,
 * and management for hybrid NFT projects.
 * 
 * @author Ibrahim Wali
 * @contact ibrahim.wali@hotmail.com
 */

import {
    Metaplex,
    keypairIdentity,
    bundlrStorage,
    toMetaplexFile,
  } from "@metaplex-foundation/js";
  import { Connection, Keypair, PublicKey } from "@solana/web3.js";
  import * as fs from "fs";
  
  // Initialize connection and Metaplex instance
  export const initializeMetaplex = (
    rpcEndpoint: string,
    payerKeypair: Keypair
  ): Metaplex => {
    const connection = new Connection(rpcEndpoint);
    
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(payerKeypair))
      .use(bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: rpcEndpoint,
        timeout: 60000,
      }));
  
    return metaplex;
  };
  
  // Upload collection metadata to Arweave
  export const uploadCollectionMetadata = async (
    metaplex: Metaplex,
    metadata: {
      name: string;
      symbol: string;
      description: string;
      image: string;
      external_url?: string;
      seller_fee_basis_points: number;
      properties: {
        files: Array<{ uri: string; type: string }>;
        category: string;
        creators: Array<{
          address: string;
          share: number;
        }>;
      };
    }
  ): Promise<string> => {
    const { uri } = await metaplex.nfts().uploadMetadata(metadata);
    console.log("Metadata uploaded:", uri);
    return uri;
  };
  
  // Create a new Metaplex collection
  export const createCollection = async (
    metaplex: Metaplex,
    collectionData: {
      name: string;
      symbol: string;
      uri: string;
      sellerFeeBasisPoints: number;
      creators: Array<{
        address: PublicKey;
        share: number;
      }>;
      collection?: PublicKey;
      isMutable?: boolean;
    }
  ) => {
    console.log("Creating collection...");
  
    const { nft: collection } = await metaplex.nfts().create({
      name: collectionData.name,
      symbol: collectionData.symbol,
      uri: collectionData.uri,
      sellerFeeBasisPoints: collectionData.sellerFeeBasisPoints,
      creators: collectionData.creators,
      isMutable: collectionData.isMutable ?? true,
      isCollection: true,
    });
  
    console.log("✅ Collection created!");
    console.log("Collection Address:", collection.address.toBase58());
    console.log("Metadata URI:", collection.uri);
  
    return collection;
  };
  
  // Verify collection authority
  export const verifyCollection = async (
    metaplex: Metaplex,
    collectionAddress: PublicKey,
    nftAddress: PublicKey
  ) => {
    console.log("Verifying collection...");
  
    await metaplex.nfts().verifyCollection({
      mintAddress: nftAddress,
      collectionMintAddress: collectionAddress,
    });
  
    console.log("✅ Collection verified!");
  };
  
  // Update collection metadata
  export const updateCollectionMetadata = async (
    metaplex: Metaplex,
    collectionAddress: PublicKey,
    newUri: string
  ) => {
    console.log("Updating collection metadata...");
  
    const collection = await metaplex
      .nfts()
      .findByMint({ mintAddress: collectionAddress });
  
    await metaplex.nfts().update({
      nftOrSft: collection,
      uri: newUri,
    });
  
    console.log("✅ Collection metadata updated!");
  };
  
  // Example usage
  export const exampleCreateCollection = async () => {
    // Load wallet from file (NEVER commit this file!)
    const payerKeypair = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(fs.readFileSync("./wallet.json", "utf-8")))
    );
  
    const metaplex = initializeMetaplex(
      "https://api.devnet.solana.com",
      payerKeypair
    );
  
    // Collection metadata
    const metadata = {
      name: "My Hybrid Collection",
      symbol: "MHC",
      description: "A revolutionary hybrid NFT collection on Solana",
      image: "https://arweave.net/your-image-url",
      external_url: "https://yourwebsite.com",
      seller_fee_basis_points: 500, // 5% royalty
      properties: {
        files: [
          {
            uri: "https://arweave.net/your-image-url",
            type: "image/png",
          },
        ],
        category: "image",
        creators: [
          {
            address: payerKeypair.publicKey.toBase58(),
            share: 100,
          },
        ],
      },
    };
  
    // Upload metadata
    const uri = await uploadCollectionMetadata(metaplex, metadata);
  
    // Create collection
    const collection = await createCollection(metaplex, {
      name: metadata.name,
      symbol: metadata.symbol,
      uri,
      sellerFeeBasisPoints: metadata.seller_fee_basis_points,
      creators: [
        {
          address: payerKeypair.publicKey,
          share: 100,
        },
      ],
      isMutable: true,
    });
  
    return collection;
  };
  
  /**
   * Need help with collection setup?
   * Contact: ibrahim.wali@hotmail.com
   * Portfolio: https://ibrahimwali.com
   * Twitter: @MibrahimWali
   */