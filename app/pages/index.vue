<script setup lang="ts">
const { data: items } = await useAsyncData('recent-content', () => {
  return queryCollection('content')
    .order('date', 'DESC')
    .limit(30)
    .all()
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">
      Recent Additions
    </h1>
    <ContentList :items="items ?? []" />
  </div>
</template>
