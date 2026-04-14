<template>
  <div class="condition-node border-l-2 border-gray-100 pl-4 py-2 space-y-3">
    <!-- Group Type (AND/OR) -->
    <div
      v-if="isGroup"
      class="flex items-center gap-3"
    >
      <div class="flex bg-gray-100 rounded-lg p-1">
        <button
          v-for="type in ['AND', 'OR']"
          :key="type"
          class="px-3 py-1 text-xs font-black rounded-md transition-all"
          :class="groupType === type ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
          @click="updateGroupType(type)"
        >
          {{ type }}
        </button>
      </div>
      <div class="h-px flex-1 bg-gray-100" />
      <button
        class="text-[10px] font-black text-primary-600 hover:text-primary-700 flex items-center gap-1 uppercase tracking-widest"
        @click="addChild"
      >
        <PlusIcon class="h-3 w-3" /> Ekle
      </button>
      <button
        v-if="depth > 0"
        class="text-gray-300 hover:text-red-500 transition-colors"
        @click="$emit('remove')"
      >
        <TrashIcon class="h-4 w-4" />
      </button>
    </div>

    <!-- Leaf Condition (Field, Operator, Value) -->
    <div
      v-else
      class="flex flex-wrap items-center gap-2 bg-gray-50/50 p-3 rounded-xl border border-dashed border-gray-200"
    >
      <!-- Field Selection -->
      <select
        v-model="internalNode.field"
        class="bg-white border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary-500/20 shadow-sm"
      >
        <option
          value=""
          disabled
        >
          Alan Seçin
        </option>
        <option
          v-for="f in fields"
          :key="f.value"
          :value="f.value"
        >
          {{ f.label }}
        </option>
      </select>

      <!-- Operator Selection -->
      <select
        v-model="internalNode.operator"
        class="bg-white border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary-500/20 shadow-sm"
      >
        <option value="eq">
          Eşittir (=)
        </option>
        <option value="neq">
          Eşit Değildir (!=)
        </option>
        <option value="gt">
          Büyüktür (&gt;)
        </option>
        <option value="gte">
          Büyük Eşittir (&gt;=)
        </option>
        <option value="lt">
          Küçüktür (&lt;)
        </option>
        <option value="lte">
          Küçük Eşittir (&lt;=)
        </option>
        <option value="contains">
          İçerir
        </option>
        <option value="in">
          İçindedir (Liste)
        </option>
      </select>

      <!-- Value Input -->
      <div class="flex-1 min-w-[120px]">
        <input
          v-if="internalNode.operator === 'in'"
          v-model="inValueInput"
          type="text"
          placeholder="Örn: PRIME, ELITE (Virgülle ayır)"
          class="w-full bg-white border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary-500/20 shadow-sm"
          @blur="updateInValue"
        >
        <input
          v-else-if="currentFieldType === 'number'"
          v-model.number="internalNode.value"
          type="number"
          class="w-full bg-white border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary-500/20 shadow-sm"
        >
        <select
          v-else-if="currentFieldType === 'boolean'"
          v-model="internalNode.value"
          class="w-full bg-white border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary-500/20 shadow-sm"
        >
          <option :value="true">
            EVET
          </option>
          <option :value="false">
            HAYIR
          </option>
        </select>
        <input
          v-else
          v-model="internalNode.value"
          type="text"
          class="w-full bg-white border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary-500/20 shadow-sm"
          placeholder="Değer..."
        >
      </div>

      <!-- Delete Button for Leaf -->
      <button
        class="p-2 text-gray-300 hover:text-red-500 transition-colors"
        @click="$emit('remove')"
      >
        <TrashIcon class="h-4 w-4" />
      </button>

      <!-- Toggle Group Button -->
      <button
        class="p-2 text-gray-300 hover:text-primary-500 transition-colors"
        title="Grup Yap"
        @click="convertToGroup"
      >
        <ArrowsRightLeftIcon class="h-4 w-4" />
      </button>
    </div>

    <!-- Recursive Children -->
    <div
      v-if="isGroup"
      class="children-container space-y-2"
    >
      <AdminBadgeConditionNode
        v-for="(child, index) in children"
        :key="index"
        :node="child"
        :depth="depth + 1"
        @remove="removeChild(index)"
        @update="updateChild(index, $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from '#imports'
import PlusIcon from '@heroicons/vue/24/outline/PlusIcon'
import TrashIcon from '@heroicons/vue/24/outline/TrashIcon'
import ArrowsRightLeftIcon from '@heroicons/vue/24/outline/ArrowsRightLeftIcon'

const props = defineProps({
    node: {
        type: Object,
        required: true
    },
    depth: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['remove', 'update'])

const internalNode = ref(JSON.parse(JSON.stringify(props.node)))
const inValueInput = ref('')

const isGroup = computed(() => !!(internalNode.value.AND || internalNode.value.OR))
const groupType = computed(() => internalNode.value.AND ? 'AND' : 'OR')
const children = computed(() => internalNode.value[groupType.value] || [])

const fields = [
    { label: 'Fiyat', value: 'price', type: 'number' },
    { label: 'Stok', value: 'stock', type: 'number' },
    { label: 'Öne Çıkarılmış', value: 'isFeatured', type: 'boolean' },
    { label: 'Özel Teklif', value: 'isSpecialOffer', type: 'boolean' },
    { label: 'Flaş İndirim', value: 'isFlashSale', type: 'boolean' },
    { label: 'Sponsorlu', value: 'isSponsored', type: 'boolean' },
    { label: 'Değerlendirme Sayısı', value: 'reviewCount', type: 'number' },
    { label: 'Üye Seviyesi', value: 'userTier', type: 'string' },
    { label: 'Saatlik Satış', value: 'soldCountLastHour', type: 'number' }
]

const currentFieldType = computed(() => {
    const f = fields.find(f => f.value === internalNode.value.field)
    return f ? f.type : 'string'
})

// Initialize inValueInput if operator is 'in'
watch(() => internalNode.value.operator, (newOp) => {
    if (newOp === 'in' && Array.isArray(internalNode.value.value)) {
        inValueInput.value = internalNode.value.value.join(', ')
    }
}, { immediate: true })

const updateInValue = () => {
    if (internalNode.value.operator === 'in') {
        internalNode.value.value = inValueInput.value.split(',').map(s => s.trim()).filter(s => s)
        emitUpdate()
    }
}

const updateGroupType = (newType) => {
    const currentChildren = children.value
    const newNode = { [newType]: currentChildren }
    internalNode.value = newNode
    emitUpdate()
}

const addChild = () => {
    const currentChildren = [...children.value]
    currentChildren.push({ field: 'price', operator: 'gt', value: 0 })
    internalNode.value[groupType.value] = currentChildren
    emitUpdate()
}

const removeChild = (index) => {
    const currentChildren = [...children.value]
    currentChildren.splice(index, 1)

    // If last child removed and depth > 0, maybe we should remove the whole group?
    // But let's keep it simple for now.
    internalNode.value[groupType.value] = currentChildren
    emitUpdate()
}

const updateChild = (index, updatedChild) => {
    const currentChildren = [...children.value]
    currentChildren[index] = updatedChild
    internalNode.value[groupType.value] = currentChildren
    emitUpdate()
}

const convertToGroup = () => {
    const currentField = internalNode.value.field
    const currentOp = internalNode.value.operator
    const currentVal = internalNode.value.value

    internalNode.value = {
        AND: [
            { field: currentField, operator: currentOp, value: currentVal }
        ]
    }
    emitUpdate()
}

const emitUpdate = () => {
    emit('update', JSON.parse(JSON.stringify(internalNode.value)))
}

// Sync internal state with prop changes
watch(() => props.node, (newVal) => {
    const newValStr = JSON.stringify(newVal)
    const currentStr = JSON.stringify(internalNode.value)
    if (newValStr !== currentStr) {
        internalNode.value = JSON.parse(newValStr)
        if (internalNode.value.operator === 'in' && Array.isArray(internalNode.value.value)) {
            inValueInput.value = internalNode.value.value.join(', ')
        }
    }
}, { deep: true })

// Emit changes when internalNode changes (for leaf nodes)
watch(internalNode, (newVal) => {
    if (!isGroup.value) {
        const newValStr = JSON.stringify(newVal)
        const currentPropStr = JSON.stringify(props.node)
        if (newValStr !== currentPropStr) {
            emitUpdate()
        }
    }
}, { deep: true })

</script>

<style scoped>
.condition-node {
    transition: all 0.2s ease;
}
</style>
