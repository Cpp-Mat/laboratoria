'use strict';
    const modules = [...document.querySelectorAll('.module')];
    const filterButtons = [...document.querySelectorAll('[data-filter]')];
    const search = document.getElementById('search');
    const normalize = value => value.toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll('ł', 'l');
    const exerciseLabel = count => count === 1 ? '1 dostępne ćwiczenie' : count + (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? ' dostępne ćwiczenia' : ' dostępnych ćwiczeń');
    let selectedFilter = 'all';
    let total = 0;
    modules.forEach(module => {
      const count = module.querySelectorAll('.exercise').length;
      total += count;
      const counter = module.querySelector('[data-module-count]');
      if (counter) counter.textContent = exerciseLabel(count);
    });
    document.getElementById('total-count').textContent = exerciseLabel(total);
    function updateCatalog() {
      const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
      let visibleModules = 0;
      let visibleExercises = 0;
      modules.forEach(module => {
        const intro = module.querySelector('.module-intro');
        const topics = module.querySelector('.topics');
        const topicText = normalize(intro.querySelector('h3').textContent + ' ' + intro.querySelector('p').textContent + ' ' + topics.textContent + ' ' + intro.querySelector('.original-module').textContent);
        const exercises = [...module.querySelectorAll('.exercise')];
        let matches = 0;
        exercises.forEach(exercise => {
          const text = normalize(intro.querySelector('h3').textContent + ' ' + exercise.textContent + ' ' + (exercise.dataset.search || ''));
          const matching = terms.every(term => text.includes(term));
          exercise.hidden = !matching;
          if (matching) matches += 1;
        });
        const topicMatches = terms.every(term => topicText.includes(term));
        const emptySearch = module.querySelector('[data-empty-search]');
        if (emptySearch) emptySearch.hidden = matches > 0 || terms.length === 0;
        const visible = (selectedFilter === 'all' || selectedFilter === module.id) && (topicMatches || matches > 0);
        module.hidden = !visible;
        if (visible) {visibleModules += 1; visibleExercises += matches;}
      });
      document.getElementById('no-results').hidden = visibleModules > 0;
      document.getElementById('results').textContent = (visibleModules === 1 ? '1 dział' : visibleModules + (visibleModules === 0 ? ' działów' : ' działy')) + ' · ' + exerciseLabel(visibleExercises);
    }
    filterButtons.forEach(button => button.addEventListener('click', () => {
      selectedFilter = button.dataset.filter;
      filterButtons.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
      updateCatalog();
    }));
    search.addEventListener('input', updateCatalog);
    document.getElementById('clear-filters').addEventListener('click', () => {
      search.value = '';
      filterButtons.find(button => button.dataset.filter === 'all').click();
      search.focus();
    });
    document.getElementById('catalog-tools').hidden = false;
    updateCatalog();
