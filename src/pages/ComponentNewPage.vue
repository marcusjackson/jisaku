<script setup lang="ts">
/**
 * ComponentNewPage
 *
 * Route entry point for creating a new component.
 * Thin wrapper that delegates to the components module's root form component.
 */

import ComponentRootForm from '@/modules/components/components/ComponentRootForm.vue'
</script>

<template>
  <ComponentRootForm mode="create" />
</template>
