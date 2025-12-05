<script setup lang="ts">
/**
 * ComponentEditPage
 *
 * Route entry point for editing an existing component.
 * Thin wrapper that delegates to the components module's root form component.
 */

import ComponentRootForm from '@/modules/components/components/ComponentRootForm.vue'
</script>

<template>
  <ComponentRootForm mode="edit" />
</template>
