
import { createWebHashHistory, createRouter } from 'vue-router'

// import HomeView from './HomeView.vue'
// import AboutView from './AboutView.vue'

import NotFoundView from '@views/NotFoundView';
// import RootView from '@views/RootView';
// import HomeView from '@views/HomeView';
import AppView from '@views/AppView';
import AppGameView from '@views/appViews/AppGameView';
import AppNotesView from '@views/appViews/AppNotesView';
import AppAboutView from '@views/appViews/AppAboutView';
import AppTavernView from '@views/appViews/AppTavernView';
import AppConfigView from '@views/appViews/AppConfigView';

// const routes = [
//   { path: '/:pathMatch(.*)*', name: '404', component: NotFoundView },
//   { path: '/', name: 'root', component: RootView },
//   { path: '/home', name: 'home', component: HomeView },
//   { path: '/app', name: 'app-root', component: AppView, children: [
//     { path: '', name: 'app', component: AppRootView },
//     { path: 'index', name: 'app-index', component: AppRootView },
//     { path: 'notes', name: 'app-notes', component: AppNotesView },
//   ] },
// ];
const routes = [
  { path: '/:pathMatch(.*)*', name: '404', component: NotFoundView },
  { path: '/', redirect: '/game' },
  { path: '/', name: 'app-root', component: AppView, children: [
    { path: 'config', name: 'app-config', component: AppConfigView },
    { path: 'game', name: 'app-game', component: AppGameView },
    { path: 'tavern', name: 'app-tavern', component: AppTavernView },
    { path: 'about', name: 'app-about', component: AppAboutView },
    { path: 'notes', name: 'app-notes', component: AppNotesView },
  ] },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
