import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';

// 追加のURLを生成するためのユーティリティ
export class UrlGenerator {
  // 人気ウェブサイトのリストを取得
  async getPopularWebsites(): Promise<string[]> {
    // Alexa Top Sitesの代替として、様々なカテゴリからURLを生成
    const additionalUrls: { [key: string]: string[] } = {
      'search': [
        'https://www.google.com',
        'https://www.bing.com',
        'https://www.duckduckgo.com',
        'https://www.yahoo.com',
        'https://www.baidu.com',
        'https://www.yandex.com',
      ],
      'video': [
        'https://www.vimeo.com',
        'https://www.dailymotion.com',
        'https://www.tiktok.com',
      ],
      'productivity': [
        'https://www.notion.so',
        'https://www.trello.com',
        'https://www.asana.com',
        'https://www.monday.com',
        'https://www.slack.com',
        'https://www.zoom.us',
        'https://www.dropbox.com',
        'https://www.google.com/drive',
      ],
      'developer': [
        'https://www.docker.com',
        'https://www.kubernetes.io',
        'https://www.terraform.io',
        'https://www.jenkins.io',
        'https://www.gitlab.com',
        'https://www.bitbucket.org',
        'https://www.npmjs.com',
        'https://www.pypi.org',
      ],
      'design': [
        'https://www.figma.com',
        'https://www.dribbble.com',
        'https://www.behance.net',
        'https://www.canva.com',
        'https://www.sketch.com',
      ],
      'food': [
        'https://www.ubereats.com',
        'https://www.doordash.com',
        'https://www.grubhub.com',
        'https://www.yelp.com',
        'https://www.opentable.com',
      ],
      'sports': [
        'https://www.espn.com',
        'https://www.nba.com',
        'https://www.nfl.com',
        'https://www.fifa.com',
        'https://www.olympic.org',
      ],
      'music': [
        'https://www.soundcloud.com',
        'https://www.pandora.com',
        'https://www.deezer.com',
        'https://www.tidal.com',
        'https://www.bandcamp.com',
      ],
      'shopping': [
        'https://www.bestbuy.com',
        'https://www.homedepot.com',
        'https://www.ikea.com',
        'https://www.costco.com',
        'https://www.sephora.com',
      ],
      'gaming': [
        'https://store.steampowered.com',
        'https://www.epicgames.com',
        'https://www.xbox.com',
        'https://www.playstation.com',
        'https://www.nintendo.com',
      ],
      'crypto': [
        'https://www.binance.com',
        'https://www.kraken.com',
        'https://www.gemini.com',
        'https://www.crypto.com',
      ],
      'realestate': [
        'https://www.zillow.com',
        'https://www.realtor.com',
        'https://www.redfin.com',
        'https://www.trulia.com',
      ],
      'jobs': [
        'https://www.indeed.com',
        'https://www.glassdoor.com',
        'https://www.monster.com',
        'https://www.ziprecruiter.com',
      ],
      'automotive': [
        'https://www.autotrader.com',
        'https://www.cars.com',
        'https://www.carvana.com',
        'https://www.carmax.com',
      ],
      'weather': [
        'https://www.weather.com',
        'https://www.accuweather.com',
        'https://www.wunderground.com',
      ],
      'reference': [
        'https://www.wikipedia.org',
        'https://www.britannica.com',
        'https://www.dictionary.com',
        'https://www.thesaurus.com',
      ],
      'forums': [
        'https://www.quora.com',
        'https://www.discourse.org',
        'https://news.ycombinator.com',
      ],
      'cloud': [
        'https://aws.amazon.com',
        'https://cloud.google.com',
        'https://azure.microsoft.com',
        'https://www.digitalocean.com',
        'https://www.linode.com',
      ],
      'communication': [
        'https://www.whatsapp.com',
        'https://www.telegram.org',
        'https://www.signal.org',
        'https://www.discord.com',
      ],
      'streaming': [
        'https://www.hulu.com',
        'https://www.disney.com',
        'https://www.hbomax.com',
        'https://www.peacocktv.com',
      ],
    };

    return Object.values(additionalUrls).flat();
  }

  // ランダムにURLをシャッフル
  shuffleUrls(urls: string[]): string[] {
    const shuffled = [...urls];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // URLリストをファイルに保存
  async saveUrlList(urls: string[], filename: string) {
    const outputPath = path.join('./data', filename);
    await fs.mkdir('./data', { recursive: true });
    await fs.writeFile(outputPath, urls.join('\n'));
    console.log(`URL list saved to ${outputPath}`);
  }
}