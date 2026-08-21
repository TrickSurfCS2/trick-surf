<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const developers = [
  {
    id: 54,
    nickname: 'EVAI',
    role: 'Lead Developer',
    description: 'Основной разработчик плагина и веб-сайта, и также ответственный за базу данных всего проекта',
  },
  {
    id: 49,
    nickname: 'Halisha',
    role: 'Game Designer',
    description: 'Геймдизайнер, спроектировал карту и придумал основную концепцию плагина',
  },
  {
    id: 73,
    nickname: 'Parta',
    role: 'Lead Tester',
    description: 'Главный тестер и создатель множества триков',
  },
  {
    id: 65,
    nickname: 'ArturPertuh',
    role: 'Surf Master',
    description: 'Рамповый владыка, дискордный повелитель и просто тригональный маестро',
  },
]

const commands = [
  { cmd: '!ski2 !strafes', desc: 'выбрать карту для отслеживания траекторий' },
  { cmd: '!saveloc !startpos', desc: 'сохранить свою позицию' },
  { cmd: '!teleport !tele !r !back', desc: 'телепорт к сохраненной позиции' },
  { cmd: '!mhud', desc: 'настройка худа со скоростью и отображением клавиш' },
  { cmd: '!triggers !t', desc: 'отображение касания триггеров' },
  { cmd: '!showtriggers !st', desc: 'отображение моделей триггеров' },
  { cmd: '!daily !d', desc: 'список ежедневных заданий-триков' },
  { cmd: '!skybox !sky', desc: 'смена скайбокса' },
  { cmd: '!skin !s', desc: 'получение скина за выполненные достижения' },
  { cmd: '!trickassist !ta', desc: 'информация о касании триггеров при входе и выходе в чате' },
  { cmd: '!tah', desc: 'информация о касании триггеров на экране' },
  { cmd: '!pack !p', desc: 'tricks pack' },
  { cmd: '!noclipme', desc: 'включить / выключить режим полета' },
  { cmd: '!zone', desc: 'телепортация к ближайшей зоне старта трика' },
]
</script>

<template>
  <div class="faq-content-module">
    <h1 class="faq-main-title">
      {{ t('faq.title') }}
    </h1>

    <!-- About Section -->
    <section class="faq-section">
      <h2 class="faq-section-title">
        <Icon icon="mdi:information-outline" class="mr-2" />
        {{ t('faq.aboutServer') }}
      </h2>
      <div class="faq-card">
        <p class="faq-text">
          {{ t('faq.aboutText1') }}
        </p>
        <div class="faq-highlight-box">
          <p><strong>Pre-Strafe:</strong> {{ t('faq.aboutPreStrafe') }}</p>
          <p><strong>Unlimited:</strong> {{ t('faq.aboutUnlimited') }}</p>
        </div>
        <p class="faq-server-ip">
          {{ t('faq.serverIp') }}:
          <code>
            <a href="steam://connect/194.147.90.131:27015">194.147.90.131:27015</a>
          </code>
        </p>
      </div>
    </section>

    <!-- Commands Section -->
    <section class="faq-section">
      <h2 class="faq-section-title">
        <Icon icon="mdi:console" class="mr-2" />
        {{ t('faq.availableCommands') }}
      </h2>
      <div class="commands-grid">
        <div v-for="(item, idx) in commands" :key="idx" class="command-card">
          <code class="command-code">{{ item.cmd }}</code>
          <span class="command-desc">{{ item.desc }}</span>
        </div>
      </div>
    </section>

    <!-- Developers Section -->
    <section class="faq-section">
      <h2 class="faq-section-title">
        <Icon icon="mdi:account-group" class="mr-2" />
        {{ t('faq.team') }}
      </h2>
      <div class="devs-grid">
        <div v-for="dev in developers" :key="dev.id" class="dev-card">
          <div class="dev-avatar">
            <Icon icon="mdi:account-circle" />
          </div>
          <div class="dev-info">
            <div class="dev-nickname">
              {{ dev.nickname }}
            </div>
            <div class="dev-role">
              {{ dev.role }}
            </div>
            <div class="dev-desc">
              {{ dev.description }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.faq-content-module {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.faq-main-title {
  text-align: center;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: 4px;
  color: var(--fg-primary-color);
  text-transform: uppercase;
}

.faq-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.faq-section-title {
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--fg-accent-color);
  border-bottom: 1px solid var(--border-primary-color);
  padding-bottom: 8px;
}

.faq-card {
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.faq-text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--fg-primary-color);
}

.faq-highlight-box {
  background-color: var(--bg-tertiary-color);
  border-left: 4px solid var(--fg-accent-color);
  padding: 12px 16px;
  border-radius: 0 8px 8px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.95rem;
}

.faq-server-ip {
  font-size: 1rem;
  color: var(--fg-secondary-color);

  code {
    background-color: var(--bg-tertiary-color);
    padding: 4px 8px;
    border-radius: 4px;
    color: var(--fg-highlight-color);
    margin-left: 8px;
    font-weight: 600;
  }
}

.commands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.command-card {
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.command-code {
  color: var(--fg-highlight-color);
  font-family: monospace;
  font-weight: 700;
  font-size: 0.95rem;
}

.command-desc {
  font-size: 0.85rem;
  color: var(--fg-secondary-color);
}

.devs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.dev-card {
  background-color: var(--bg-secondary-color);
  border: 1px solid var(--border-primary-color);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}

.dev-avatar {
  font-size: 48px;
  color: var(--fg-accent-color);
}

.dev-nickname {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--fg-primary-color);
}

.dev-role {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--fg-accent-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dev-desc {
  font-size: 0.8rem;
  color: var(--fg-secondary-color);
  line-height: 1.4;
}
</style>
