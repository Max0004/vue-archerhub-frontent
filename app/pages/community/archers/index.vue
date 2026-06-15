<template>
  <div class="container mx-auto p-6">
    <h1 class="primary-header text-center mb-4">Schützen Community</h1>
    <div class="mb-6 ">
      <input v-model="searchQuery" type="text" class="p-2 border w-full border-gray-300 rounded" placeholder="Sucher nach Name..." />
    </div>

    <div class="mb-6 grid grid-cols-3 gap-4">
      <label class="mr-4 mt-2">Sortieren nach:</label>
      <select v-model="selectedSortType" @change="applySorting" class="p-2 border border-gray-300 rounded cursor-pointer">
        <option value="lastName">Nachname</option>
        <option value="age">Alter</option>
        <option value="club">Verein</option>
        <option value="ageBracket">Altersklasse</option>
      </select>
      <div v-if="['lastName', 'age'].includes(selectedSortType)">
        <select v-model="selectedSortOrder" @change="applySorting" class="p-2 border border-gray-300 rounded cursor-pointer">
          <option value="asc">Aufsteigend</option>
          <option value="desc">Absteigend</option>
        </select>
      </div>
    </div>

    <div v-if="['club', 'ageBracket'].includes(selectedSortType)" class="gap-6">
      <div v-for="(items, group) in groupedData" :key="group">
        <div v-if="items.length" class="cursor-pointer p-4 border-b border-gray-300" @click="toggleGroup(group)">
          <h2 class="text-2xl font-semibold">{{ group }}</h2>
        </div>
        <div v-if="expandedGroups[group]" class="ml-4">
          <p>{{ items.length }} item{{ items.length > 1 ? "s" : "" }}</p>
          <div v-for="archer in items" :key="archer.id" @click="moveToLandingPage(archer.id)"
            class="p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <UAvatar size="lg" :alt="archer.firstname + ' ' + archer.lastname" />
            <h3 class="inline text-xl font-bold mb-2 ml-4">
              <span v-if="archer.title">{{ archer.title }}</span> {{ archer.firstname }} {{ archer.lastname }} ({{ archer.birthday ? calculateAge(archer.birthday) : 'k.A.' }})
            </h3>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="grid grid-cols-3 mb-5">
        <button :disabled="currentPage === 1" @click="changePage(-1)" class="px-4 py-2 bg-gray-300 rounded cursor-pointer">
          <
        </button>
        <span class="text-center mt-4">{{ currentPage }}/{{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="changePage(1)" class="px-4 py-2 bg-gray-300 rounded cursor-pointer">
          >
        </button>
      </div>
      <div v-for="archer in paginatedData" :key="archer.id" @click="moveToLandingPage(archer.id)"
        class="p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
        <UAvatar size="lg" :alt="archer.firstname + ' ' + archer.lastname" />
        <h3 class="inline secondary-header mb-2 ml-4">
          <span v-if="archer.title">{{ archer.title }}</span> {{ archer.firstname }} {{ archer.lastname }} ({{ archer.birthday ? calculateAge(archer.birthday) : 'k.A.' }})
        </h3>
      </div>
    </div>

    <div v-if="error" class="text-center text-red-500 mt-4">{{ error }}</div>
    <div v-else-if="!archers.length" class="text-center comment mt-10">
      <p>Keine Community vorhanden</p>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const searchQuery = ref('');

  const archers = ref([]);
  const clubs = ref([]);
  const error = ref(null);
  const selectedSortType = ref("lastName");
  const selectedSortOrder = ref("asc");
  const expandedGroups = ref({});
  const currentPage = ref(1);
  const itemsPerPage = 10;

  // Helper functions
  const calculateAge = (birthday: string): number | null => {
    if(!birthday) return null
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    if (month < birthDate.getMonth() || (month === birthDate.getMonth() && day < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const groupByClubs = (archers, clubs) => {
    const clubMap = {};

    // Build a map of club IDs to club names for easy lookup
    clubs.forEach(club => {
      clubMap[club.id] = club.name;
    });

    const grouped = {};

    // Group archers by their clubs
    archers.forEach(archer => {
      if (archer.clubs.length === 0) {
        // If the archer doesn't belong to any club, group under "Clubless"
        if (!grouped["Vereinslos"]) grouped["Vereinslos"] = [];
        grouped["Vereinslos"].push(archer);
      } else {
        archer.clubs.forEach(userClub => {
          const clubName = clubMap[userClub.club_id];
          if (clubName) {
            if (!grouped[clubName]) grouped[clubName] = [];
            grouped[clubName].push(archer);
          }
        });
      }
    });

    return grouped;
  };

  const groupedData = computed(() => {
    if (selectedSortType.value === "ageBracket") {
      return groupedArchers.value;
    }
    if (selectedSortType.value === "club") {
      return groupByClubs(archers.value, clubs.value);
    }
    return {};
  });

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    let sortedArchers = [...filteredArchers.value];

    if (selectedSortType.value === "lastName") {
      sortedArchers.sort((a, b) => selectedSortOrder.value === "asc"
        ? a.lastname.localeCompare(b.lastname)
        : b.lastname.localeCompare(a.lastname));
    }

    if (selectedSortType.value === "age") {
      sortedArchers.sort((a, b) => {
        const aHasBirthday = !!a.birthday;
        const bHasBirthday = !!b.birthday;

        // Handle unknown birthdays
        if (!aHasBirthday && !bHasBirthday) return 0;

        if (!aHasBirthday) {
          return selectedSortOrder.value === "asc" ? 1 : -1;
        }

        if (!bHasBirthday) {
          return selectedSortOrder.value === "asc" ? -1 : 1;
        }

        // Normal age sorting
        const ageDiff = calculateAge(a.birthday) - calculateAge(b.birthday);

        return selectedSortOrder.value === "asc"
          ? ageDiff
          : -ageDiff;
      });
    }

    return sortedArchers.slice(start, end);
  });

  const totalPages = computed(() => {
    return Math.ceil(filteredArchers.value.length / itemsPerPage);
  });

  // Expand/collapse logic
  const toggleGroup = (group) => {
    expandedGroups.value[group] = !expandedGroups.value[group];
  };

  const changePage = (step) => {
    currentPage.value = Math.max(1, Math.min(currentPage.value + step, totalPages.value));
  };

  const applySorting = () => {
    currentPage.value = 1;
    if (['club', 'ageBracket'].includes(selectedSortType.value)) {
      expandedGroups.value = {};
    }
  };

  const filteredArchers = computed(() => {
    if(!searchQuery.value.trim()) return archers.value;
    const query = searchQuery.value.toLowerCase();

    return archers.value.filter((archer) => {
      const fullName = `${archer.firstname} ${archer.lastname}`.toLowerCase();
      return (
        archer.firstname.toLowerCase().includes(query) ||
        archer.lastname.toLowerCase().includes(query) ||
        fullName.includes(query)
      );
    })
  })

  // Fetch data
  const router = useRouter();
  onMounted(async () => {
    try {
      const users = await $fetch(`/api/postgres/archer`, {method: "GET"});
      if (users.error) {
        error.value = users.error;
      } else {
        archers.value = users;
      }
    } catch (err) {
      error.value = 'An error occurred while fetching user data.';
      console.error(err);
    }
    try {
      const allClubs = await $fetch(`/api/postgres/club`,{method: "GET"});
      if (allClubs.error) {
        error.value = allClubs.error;
      } else {
        clubs.value = allClubs.filter(club => club.id !== 998 && club.id !== 999);
      }
    } catch (err) {
      error.value = 'An error occurred while fetching user data.';
      console.error(err);
    }
  });

  // Grouped Archers by Age Bracket
  const groupedArchers = computed(() => {
    const groups = {
      "Schüler C männl.": [],
      "Schüler C weibl.": [],
      "Schüler B männl.": [],
      "Schüler B weibl.": [],
      "Schüler A männl.": [],
      "Schüler A weibl.": [],
      "Jugend männl.": [],
      "Jugend weibl.": [],
      "Junior männl.": [],
      "Junior weibl.": [],
      "Herren": [],
      "Damen": [],
      "Masters Herren": [],
      "Masters Damen": [],
      "Senioren": [],
      "Seniorinnen": [],
      "k.A.": []
    };

    filteredArchers.value.forEach((archer) => {
      const age = calculateAge(archer.birthday);
      const gender = archer.gender;
      if(!age) {
        groups["k.A."].push(archer);
      } else if (age <= 10) {
        if (gender === 'Male') groups["Schüler C männl."].push(archer);
        else groups["Schüler C weibl."].push(archer);
      } else if (age >= 11 && age <= 12) {
        if (gender === 'Male') groups["Schüler B männl."].push(archer);
        else groups["Schüler B weibl."].push(archer);
      } else if (age >= 13 && age <= 14) {
        if (gender === 'Male') groups["Schüler A männl."].push(archer);
        else groups["Schüler A weibl."].push(archer);
      } else if (age >= 15 && age <= 17) {
        if (gender === 'Male') groups["Jugend männl."].push(archer);
        else groups["Jugend weibl."].push(archer);
      } else if (age >= 18 && age <= 20) {
        if (gender === 'Male') groups["Junior männl."].push(archer);
        else groups["Junior weibl."].push(archer);
      } else if (age >= 21 && age <= 49) {
        if (gender === 'Male') groups["Herren"].push(archer);
        else groups["Damen"].push(archer);
      } else if (age >= 50 && age <= 65) {
        if (gender === 'Male') groups["Masters Herren"].push(archer);
        else groups["Masters Damen"].push(archer);
      } else if (age >= 66) {
        if (gender === 'Male') groups["Senioren"].push(archer);
        else groups["Seniorinnen"].push(archer);
      }
    });

    return groups;
  });

  const moveToLandingPage = (archerId) => {
    router.push(`archers/${archerId}`);
  };
</script>