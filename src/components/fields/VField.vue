<script setup lang="ts">
defineProps<{
    label: string
}>()
</script>

<template>
    <label class="flex flex-col gap-2 sm:flex-row">
        <div class="font-bold sm:flex sm:h-8 sm:w-64 sm:items-center sm:text-lg">
            {{ label }}
        </div>
        <slot />
    </label>
</template>
