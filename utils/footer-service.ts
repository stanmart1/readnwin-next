import { query } from './database';

export interface FooterSettings {
  company: {
    name: string;
    description: string;
    tagline: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  links: {
    quick_links: Array<{ name: string; url: string }>;
    categories: Array<{ name: string; url: string }>;
  };
  newsletter: {
    enabled: boolean;
    title: string;
    description: string;
  };
}

let footerCache: FooterSettings | null = null;
let cacheExpiry = 0;

export class FooterService {
  static async getFooterSettings(): Promise<FooterSettings> {
    if (footerCache && Date.now() < cacheExpiry) {
      return footerCache;
    }

    try {
      const result = await query(`
        SELECT section, content 
        FROM footer_settings 
        WHERE is_active = TRUE
        ORDER BY section
      `);

      const settings: any = {};
      result.rows.forEach(row => {
        settings[row.section] = row.content;
      });

      footerCache = settings as FooterSettings;
      cacheExpiry = Date.now() + 300000; // 5 minutes cache
      return footerCache;
    } catch (error) {
      console.error('Error fetching footer settings:', error);
      return this.getDefaultSettings();
    }
  }

  static async updateFooterSection(section: string, content: any, userId: number): Promise<boolean> {
    try {
      await query(`
        UPDATE footer_settings 
        SET content = $1, updated_by = $2 
        WHERE section = $3
      `, [JSON.stringify(content), userId, section]);
      
      footerCache = null; // Clear cache
      return true;
    } catch (error) {
      console.error('Error updating footer section:', error);
      return false;
    }
  }

  static async initializeDefaultData(): Promise<boolean> {
    try {
      const defaultData = {
        company: {
          name: "ReadnWin",
          description: "The ultimate digital and social reading platform that promotes the reading culture amongst young African youths through incentive, social, and educative projects that fit just right.",
          tagline: "Your Digital Bookstore"
        },
        contact: {
          address: "Lagos, Nigeria",
          phone: "+234 XXX XXX XXXX",
          email: "info@readnwin.com"
        },
        social: {
          facebook: "",
          twitter: "",
          instagram: "",
          linkedin: ""
        },
        links: {
          quick_links: [
            { name: "Terms of Service", url: "/terms" },
            { name: "Privacy Policy", url: "/privacy" },
            { name: "About Us", url: "/about" },
            { name: "Contact Us", url: "/contact" }
          ],
          categories: []
        },
        newsletter: {
          enabled: true,
          title: "Stay Updated",
          description: "Get the latest books and offers"
        }
      };

      for (const [section, content] of Object.entries(defaultData)) {
        await query(`
          INSERT INTO footer_settings (section, content, updated_by) 
          VALUES ($1, $2, 1)
          ON CONFLICT (section) 
          DO UPDATE SET content = $2
        `, [section, JSON.stringify(content)]);
      }

      footerCache = null;
      return true;
    } catch (error) {
      console.error('Error initializing default footer data:', error);
      return false;
    }
  }

  private static getDefaultSettings(): FooterSettings {
    return {
      company: {
        name: "ReadnWin",
        description: "Discover, read, and enjoy books in digital and physical formats",
        tagline: "Your Digital Bookstore"
      },
      contact: {
        address: "Lagos, Nigeria",
        phone: "+234 XXX XXX XXXX",
        email: "info@readnwin.com"
      },
      social: {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: ""
      },
      links: {
        quick_links: [
          { name: "About Us", url: "/about" },
          { name: "Contact", url: "/contact" },
          { name: "FAQ", url: "/faq" }
        ],
        categories: []
      },
      newsletter: {
        enabled: true,
        title: "Stay Updated",
        description: "Get the latest books and offers"
      }
    };
  }
}