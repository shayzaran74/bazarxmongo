<template>
  <div class="text-center py-12">
    <component
      :is="icon"
      class="mx-auto h-12 w-12 text-gray-400"
    />
    <h3 class="mt-2 text-sm font-medium text-gray-900">
      {{ title }}
    </h3>
    <p class="mt-1 text-sm text-gray-500">
      {{ description }}
    </p>
    <div
      v-if="actionText"
      class="mt-6"
    >
      <button
        v-if="actionLink"
        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        @click="navigate"
      >
        <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
        {{ actionText }}
      </button>
      <slot
        v-else
        name="action"
      >
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          @click="$emit('action')"
        >
          <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
          {{ actionText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { navigateTo } from '#imports'
import PlusIcon from '@heroicons/vue/24/outline/PlusIcon'

const props = defineProps({
  icon: {
    type: [Object, Function],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  actionText: {
    type: String,
    default: ''
  },
  actionLink: {
    type: String,
    default: ''
  }
})

const navigate = () => {
  if (props.actionLink) {
    navigateTo(props.actionLink)
  }
}

defineEmits(['action'])
</script>
