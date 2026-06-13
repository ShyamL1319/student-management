import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getSuggestions(query: string) {
    const term = query.trim();
    if (!term) {
      return { results: [] };
    }

    const parts = term.split(/\s+/);
    let filter: any = {};
    if (parts.length === 1) {
      filter = {
        $or: [
          { firstName: { $regex: '^' + this.escapeRegex(parts[0]), $options: 'i' } },
          { lastName: { $regex: '^' + this.escapeRegex(parts[0]), $options: 'i' } },
          { email: { $regex: '^' + this.escapeRegex(parts[0]), $options: 'i' } },
        ],
      };
    } else {
      filter = {
        firstName: { $regex: '^' + this.escapeRegex(parts[0]), $options: 'i' },
        lastName: { $regex: '^' + this.escapeRegex(parts[1]), $options: 'i' },
      };
    }

    const matches = await this.userModel
      .find(filter)
      .select('_id firstName lastName roleType email admissionNumber rollNumber')
      .limit(15)
      .lean()
      .exec();

    const results = matches.map((m: any) => {
      let label = `${m.firstName} ${m.lastName || ''}`.trim();
      if (m.roleType === 'STUDENT' && m.rollNumber) {
        label += ` (Roll No: ${m.rollNumber})`;
      } else if (m.email) {
        label += ` (${m.email})`;
      }
      return {
        id: m._id.toString(),
        label,
        type: (m.roleType || 'user').toLowerCase(),
      };
    });

    return { results };
  }

  private escapeRegex(text: string): string {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }
}
