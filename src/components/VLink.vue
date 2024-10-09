<script setup lang="ts">
defineProps<{
    url: string
}>()
</script>

<template>
    <a class="break-words underline" :href="url" target="_blank">
        {{ url }}
    </a>
</template>
