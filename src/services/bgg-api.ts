import type { BGGGame, BGGSearchResult } from '@/types/bgg';

const BGG_BASE_URL = 'https://boardgamegeek.com/xmlapi2';
const CORS_PROXY = 'https://api.allorigins.win/get?url=';

const useCORSProxy = true;

class BGGApiService {
  private async fetchXML(url: string): Promise<Document> {
    try {
      const response = await fetch(`${useCORSProxy ? CORS_PROXY : ''}${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const parser = new DOMParser();
      return parser.parseFromString(data.contents, 'text/xml');
    } catch (error) {
      console.error('BGG API Error:', error);
      throw new Error('Failed to fetch data from BoardGameGeek');
    }
  }

  private parseSearchResults(xml: Document): BGGSearchResult[] {
    const items = xml.querySelectorAll('item');
    return Array.from(items).map(item => ({
      id: item.getAttribute('id') || '',
      name: item.querySelector('name')?.getAttribute('value') || '',
      yearPublished: parseInt(item.querySelector('yearpublished')?.getAttribute('value') || '0') || undefined,
      type: item.getAttribute('type') || 'boardgame',
      thumbnail: item.querySelector('thumbnail')?.getAttribute('value') || '',
    }));
  }

  private parseGameDetails(xml: Document): BGGGame[] {
    const items = xml.querySelectorAll('item');
    return Array.from(items).map(item => {
      const id = item.getAttribute('id') || '';
      const names = item.querySelectorAll('name');
      const primaryName = Array.from(names).find(name => name.getAttribute('type') === 'primary');
      const name = primaryName?.getAttribute('value') || names[0]?.getAttribute('value') || '';

      const description = item.querySelector('description')?.textContent || '';
      const thumbnail = item.querySelector('thumbnail')?.textContent || '';
      const image = item.querySelector('image')?.textContent || '';

      const yearPublished = parseInt(item.querySelector('yearpublished')?.getAttribute('value') || '0') || undefined;
      const minPlayers = parseInt(item.querySelector('minplayers')?.getAttribute('value') || '0') || undefined;
      const maxPlayers = parseInt(item.querySelector('maxplayers')?.getAttribute('value') || '0') || undefined;
      const playingTime = parseInt(item.querySelector('playingtime')?.getAttribute('value') || '0') || undefined;
      const minPlayTime = parseInt(item.querySelector('minplaytime')?.getAttribute('value') || '0') || undefined;
      const maxPlayTime = parseInt(item.querySelector('maxplaytime')?.getAttribute('value') || '0') || undefined;
      const minAge = parseInt(item.querySelector('minage')?.getAttribute('value') || '0') || undefined;

      // Parse categories, mechanics, families
      const categories = Array.from(item.querySelectorAll('link[type="boardgamecategory"]'))
        .map(link => link.getAttribute('value') || '');
      const mechanics = Array.from(item.querySelectorAll('link[type="boardgamemechanic"]'))
        .map(link => link.getAttribute('value') || '');
      const families = Array.from(item.querySelectorAll('link[type="boardgamefamily"]'))
        .map(link => link.getAttribute('value') || '');
      const designers = Array.from(item.querySelectorAll('link[type="boardgamedesigner"]'))
        .map(link => link.getAttribute('value') || '');
      const publishers = Array.from(item.querySelectorAll('link[type="boardgamepublisher"]'))
        .map(link => link.getAttribute('value') || '');
      const artists = Array.from(item.querySelectorAll('link[type="boardgameartist"]'))
        .map(link => link.getAttribute('value') || '');

      // Parse ratings
      const statistics = item.querySelector('statistics ratings');
      const averageRating = parseFloat(statistics?.querySelector('average')?.getAttribute('value') || '0') || undefined;
      const bayesAverageRating = parseFloat(statistics?.querySelector('bayesaverage')?.getAttribute('value') || '0') || undefined;
      const usersRated = parseInt(statistics?.querySelector('usersrated')?.getAttribute('value') || '0') || undefined;
      const complexity = parseFloat(statistics?.querySelector('averageweight')?.getAttribute('value') || '0') || undefined;

      const rankElement = statistics?.querySelector('rank[name="boardgame"]');
      const rank = parseInt(rankElement?.getAttribute('value') || '0') || undefined;

      return {
        id,
        name,
        thumbnail,
        image,
        description: description.replace(/<[^>]*>/g, ''), // Strip HTML tags
        yearPublished,
        minPlayers,
        maxPlayers,
        playingTime,
        minPlayTime,
        maxPlayTime,
        minAge,
        categories: categories.filter(Boolean),
        mechanics: mechanics.filter(Boolean),
        families: families.filter(Boolean),
        designers: designers.filter(Boolean),
        publishers: publishers.filter(Boolean),
        artists: artists.filter(Boolean),
        averageRating,
        bayesAverageRating,
        usersRated,
        rank,
        complexity
      };
    });
  }

  async searchGames(query: string): Promise<BGGSearchResult[]> {
    if (!query.trim()) return [];
    
    const url = `${BGG_BASE_URL}/search?query=${encodeURIComponent(query)}&type=boardgame`;
    const xml = await this.fetchXML(url);
    return this.parseSearchResults(xml);
  }

  async getGameDetails(gameIds: string[]): Promise<BGGGame[]> {
    if (gameIds.length === 0) return [];
    
    const url = `${BGG_BASE_URL}/thing?id=${gameIds.join(',')}&stats=1`;
    const xml = await this.fetchXML(url);
    return this.parseGameDetails(xml);
  }

  async getGameById(gameId: string): Promise<BGGGame | null> {
    const games = await this.getGameDetails([gameId]);
    return games[0] || null;
  }

  async getPopularGames(limit: number = 50): Promise<BGGGame[]> {
    // Get top games from BGG rankings
    const gameIds = Array.from({ length: limit }, (_, i) => (i + 1).toString());
    return this.getGameDetails(gameIds);
  }

  async getHotGames(): Promise<BGGSearchResult[]> {
    const url = `${BGG_BASE_URL}/hot?type=boardgame`;
    const xml = await this.fetchXML(url);
    return this.parseSearchResults(xml);
  }
}

export const bggApi = new BGGApiService();