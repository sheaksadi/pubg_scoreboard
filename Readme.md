# PUBG Custom Match Stats Discord Bot

This bot provides PUBG custom match statistics to a Discord channel via a webhook. It allows users to subscribe to updates, fetch specific game stats, and access recent custom game information.
Also keeps track of top players and sends the leaderboard to webhook.

## Installation

To run the bot, follow these steps:

1. Clone the repository:
```bash
git clone https://github.com/sheaksadi/pubg_scoreboard.git
cd pubg_scoreboard
```
2. .env file
```dotenv
DISCORD_TOKEN="<YOUR_DISCORD_BOT_TOKEN>"
WEBHOOK_URL="<YOUR_DISCORD_WEBHOOK_URL>"
DISCORD_AVTAR="<YOUR_DISCORD_AVATAR_URL>"
DISCORD_CLIENT_ID="<YOUR_DISCORD_CLIENT_ID>" //get from discord developer portal


PUBG_API_KEY='<YOUR_PUBG_API_KEY>'

DB_FILE_NAME='file.db' // any file name
```
3. Run Docker Compose:
```bash
docker compose up app
```

## Commands

### `/subscribe`
- **Description**: Subscribe to receive PUBG custom match statistics via a Discord webhook (auto unsubscribed after 2 hours).
- **Usage**: `/subscribe`

### `/unsubscribe`
- **Description**: Unsubscribe from receiving PUBG custom match updates.
- **Usage**: `/unsubscribe`

### `/get`
- **Description**: Fetch the most recent custom game statistics for a specified player.
- **Usage**: `/get [player_name]`
- **Example**: `/get Sheaksadi`

### `/get_id`
- **Description**: Fetch detailed statistics for a custom game using its unique game ID.
- **Usage**: `/get_id [MatchId]`
- **Example**: `/get_id 12345678`

### `/leaderboard`
- **Description**: Sends a leaderboard of top players.
- **Usage**: `/leaderboard`

### `/reset`
- **Description**: Reset Leaderboard.
- **Usage**: `/reset`

## MVP Score Calculation

The bot calculates the score based on the following formula:
```bash
MvpScore = weight_kills × kills + weight_assists × assists + weight_damageDealt × damageDealt + weight_timeSurvived × timeSurvivedNormalized + weight_rank × rankBonus
```

[//]: # (  $$)

[//]: # (  \text{MvpScore} = \text{weight}_\text{kills} \cdot \text{kills} +)

[//]: # (  \text{weight}_\text{assists} \cdot \text{assists} +)

[//]: # (  \text{weight}_\text{damageDealt} \cdot \text{damageDealt} +)

[//]: # (  \text{weight}_\text{timeSurvived} \cdot \text{timeSurvivedNormalized} +)

[//]: # (  \text{weight}_\text{rank} \cdot \text{rankBonus})

[//]: # (  $$)

### Current weights
```javascript
    const W_k = 3;   // Weight for kills
    const W_a = 1;   // Weight for assists
    const W_d = 0.01; // Weight for damage
    const W_s = 0.5; // Weight for survival
    const W_r = 10;  // Weight for rank bonus
```

## Features

- **Subscribe for Updates**: Automatically receive PUBG custom match stats in a designated Discord channel.
- **Leaderboard**: Sends a leaderboard of top players.
- **Unsubscribe from Updates**: Stop receiving automatic updates.
- **Fetch Latest Stats**: Retrieve the latest custom match stats of a specific player.
- **Fetch Stats by Game ID**: Get detailed stats for a specific game using its ID.


## Contact

If you have questions or feedback, feel free to open an issue or reach out to the maintainer.