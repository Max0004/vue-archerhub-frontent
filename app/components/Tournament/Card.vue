<template>
  <div class="bg-white shadow-md rounded-lg p-4 mb-4">
    <div @click="openModal(tournament)" class="cursor-pointer hover:bg-gray-100 rounded-lg p-4">
      <h3 class="secondary-header">{{ tournament.tournament_name }}</h3>
  
      <div class="flex items-center gap-2 mb-2">
        <Calendar class="w-4 h-4 text-orange-500" />
        <span class="comment">{{ formattedDate }}</span>
      </div>
  
      <div class="flex items-center gap-2 mb-2">
        <Users class="w-4 h-4 text-orange-500" />
        <span class="comment">{{ tournament.organizer_name }}</span>
      </div>

      <div class="flex items-center gap-2 mb-2">
        <MapPin class="w-4 h-4 text-orange-500" />
        <span class="comment">{{ tournament.place }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { format } from 'date-fns';
  import { Users, Calendar, MapPin } from 'lucide-vue-next';

  const props = defineProps({
    tournament: {
      type: Object,
      required: true,
    },
  });
  
  const emit = defineEmits(['open-modal']);

  const openModal = (tournament) => {
    emit('open-modal', tournament);
  };

  const formattedDate = computed(() => {
    const startDate = format(new Date(props.tournament.startdate), 'dd. MMMM yyyy');
  
    if (props.tournament.enddate != null) {
      const endDate = format(new Date(props.tournament.enddate), 'dd. MMMM yyyy');
      return `${startDate} - ${endDate}`;
    }

    return startDate;
  });
</script>