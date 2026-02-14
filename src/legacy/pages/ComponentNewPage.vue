<script setup lang="ts">
/**
 * ComponentNewPage
 *
 * Route entry point for creating a new component.
 * Thin wrapper that delegates to the component module's root form component.
 */

import ComponentRootForm from '@/legacy/modules/component/components/ComponentRootForm.vue'
</script>

<template>
  <ComponentRootForm mode="create" />
</template>
