# Farcaster Cross-poster

## What it does
- Automatically cross-posts articles from a Paragraph.xyz publication to Farcaster, making content sharing automated.
- Design allows for compatibility with other Arweave-based hosting platforms like Mirror, requiring only minor modifications (Thanks for the advice [Colin](https://warpcast.com/colin/0xe6a4b3ad)).

## How it works
- The application is designed to run as a cron job, ideally checking for new content every 10 minutes.
- Relies on Redis for storing the timestamp of the last cross-posted article, for tracking and avoiding duplicate postings. You can easily adapt to other storage solutions if needed.
- Currently, the system does not support pagination, but it's built to handle up to 100 articles per page. This can be easily extended for more pagination needs.
- Requires a Neynar subscription for posting to Farcaster. Users must create a [signer](https://docs.neynar.com/docs/write-to-farcaster-with-neynar-managed-signers) to authenticate and authorize posts.
- In order to avoid rate limits from Neynar, we only post 5 casts at a time.

## Environment variables

Each environment variable plays a crucial role in configuring the application:

- NEYNAR_API_KEY: Your unique API key provided by Neynar, used for authenticating API requests to Farcaster.
- NEYNAR_SIGNER_UUID: The unique identifier for your Neynar-managed signer, crucial for securing and validating your cross-posts to Farcaster.
- PARAGRAPH_PUBLICATION_SLUG: Identifies the specific publication slug on Paragraph XYZ from which articles will be cross-posted.
- PARAGRAPH_URL: The base URL for Paragraph XYZ Publication, required for hyperlinks
- REDIS_URL: The connection string for your Redis instance, used for storing and retrieving the last cross-posted article's data.
- REDIS_KEY: A specific key in Redis under which the last cross-posted article's timestamp is store.


## Running Instructions

To get the Farcaster Cross-poster up and running on your system, follow these steps:

1. **Clone the Repository**
   - Begin by cloning the repository to your local machine. You can do this by running:
     ```bash
     git clone https://github.com/PirosB3/Paragraph-Farcaster-xposter.git
     ```

2. **Install Dependencies**
   - Navigate to the cloned directory and install the required dependencies using Yarn:
     ```bash
     cd Paragraph-Farcaster-xposter
     yarn
     ```

3. **Build the Application**
   - Compile the TypeScript code into JavaScript for execution:
     ```bash
     yarn build
     ```

4. **Set Environment Variables**
   - Set up the required environment variables. You can use a tool like `direnv` for convenience. Create a `.env` file in the root of the project and add the necessary variables

5. **Run the Application**
   - Finally, run the built application with Node.js:
     ```bash
     node build/main.js
     ```
   - This will start the application and begin cross-posting articles based on your specified configuration.
