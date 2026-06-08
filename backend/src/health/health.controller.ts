import { Controller, Get } from '@nestjs/common';
import { ApiHealthTags, ApiCheckHealth } from './health.swagger';

@ApiHealthTags()
@Controller('health')
export class HealthController {
  @Get()
  @ApiCheckHealth()
  check() {
    return {
      status: 'ok',
      timestamp: new Date(),
    };
  }
}
