<template>
  <div
    v-if="editor"
    class="rich-editor-container border border-slate-700/50 rounded-xl overflow-hidden bg-slate-900/50 backdrop-blur-md"
  >
    <!-- Toolbar -->
    <div class="toolbar flex flex-wrap gap-1 p-2 bg-slate-800/50 border-b border-slate-700/50">
      <button
        :class="{ 'bg-blue-600': editor.isActive('bold') }"
        class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200"
        title="Bold"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <span class="font-bold text-lg">B</span>
      </button>
      <button
        :class="{ 'bg-blue-600': editor.isActive('italic') }"
        class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200 italic"
        title="Italic"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <span class="text-lg">I</span>
      </button>
      <button
        :class="{ 'bg-blue-600': editor.isActive('strike') }"
        class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200 line-through"
        title="Strike"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <span class="text-lg">S</span>
      </button>
      <button
        :class="{ 'bg-blue-600': editor.isActive('underline') }"
        class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200 underline"
        title="Underline"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <span class="text-lg">U</span>
      </button>

      <div class="w-px h-6 bg-slate-700 mx-1 self-center" />

      <button
        :class="{ 'bg-blue-600': editor.isActive('heading', { level: 1 }) }"
        class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200"
        title="H1"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        H1
      </button>
      <button
        :class="{ 'bg-blue-600': editor.isActive('heading', { level: 2 }) }"
        class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200"
        title="H2"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>

      <div class="w-px h-6 bg-slate-700 mx-1 self-center" />

      <button
        :class="{ 'bg-blue-600': editor.isActive('bulletList') }"
        class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200"
        title="Bullet List"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        • List
      </button>
      <button
        :class="{ 'bg-blue-600': editor.isActive('orderedList') }"
        class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200"
        title="Ordered List"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        1. List
      </button>
      <button
        :class="{ 'bg-blue-600': editor.isActive('blockquote') }"
        class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200"
        title="Quote"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        "
      </button>

      <div class="w-px h-6 bg-slate-700 mx-1 self-center" />

      <button
        :class="{ 'bg-blue-600': editor.isActive('link') }"
        class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200"
        title="Link"
        @click="addLink"
      >
        🔗
      </button>
      <button
        class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200"
        title="Image"
        @click="addImage"
      >
        🖼️
      </button>
      <button
        class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200"
        title="YouTube"
        @click="addYoutube"
      >
        📺
      </button>

      <div class="ml-auto flex gap-1">
        <button
          class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200"
          title="Undo"
          @click="editor.chain().focus().undo().run()"
        >
          ↩️
        </button>
        <button
          class="p-2 rounded hover:bg-slate-700 transition-colors text-slate-200"
          title="Redo"
          @click="editor.chain().focus().redo().run()"
        >
          ↪️
        </button>
      </div>
    </div>

    <!-- Editor Content -->
    <editor-content
      :editor="editor"
      class="prose prose-invert max-w-none p-4 min-h-[300px] outline-none"
    />
  </div>
</template>

<script setup>
import { watch, onBeforeUnmount } from '#imports'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
    content: props.modelValue,
    extensions: [
        StarterKit,
        Underline,
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: 'text-blue-400 underline cursor-pointer'
            }
        }),
        Image.configure({
            HTMLAttributes: {
                class: 'rounded-lg max-w-full h-auto border border-slate-700'
            }
        }),
        Youtube.configure({
            width: 640,
            height: 360,
        })
    ],
    onUpdate: ({ editor }) => {
        emit('update:modelValue', editor.getHTML())
    },
    editorProps: {
        attributes: {
            class: 'focus:outline-none min-h-[300px]'
        }
    }
})

watch(() => props.modelValue, (value) => {
    if (!editor.value) return
    const isSame = editor.value.getHTML() === value
    if (!isSame) {
        editor.value.commands.setContent(value, false)
    }
})

const addLink = () => {
    if (!editor.value) return
    const url = window.prompt('URL Girin:')
    if (url) {
        editor.value.chain().focus().setLink({ href: url }).run()
    }
}

const addImage = () => {
    if (!editor.value) return
    const url = window.prompt('Resim URL Girin:')
    if (url) {
        editor.value.chain().focus().setImage({ src: url }).run()
    }
}

const addYoutube = () => {
    if (!editor.value) return
    const url = window.prompt('YouTube Video URL Girin:')
    if (url) {
        editor.value.commands.setYoutubeVideo({
            src: url,
            width: 640,
            height: 360,
        })
    }
}

onBeforeUnmount(() => {
    if (editor.value) {
        editor.value.destroy()
    }
})
</script>

<style>
.ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #64748b;
    pointer-events: none;
    height: 0;
}

.rich-editor-container .ProseMirror {
    min-height: 300px;
}

.rich-editor-container .ProseMirror:focus {
    outline: none;
}
</style>
