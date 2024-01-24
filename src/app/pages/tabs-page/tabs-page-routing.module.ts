import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs-page';


const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'schedule',
        loadChildren: () => import('../map/map.module').then(m => m.MapModule)
      },
      {
        path: 'signup',
        loadChildren: () => import('../signup/signup.module').then(m => m.SignUpModule)
      },
      {
        path: 'search',
        loadChildren: () => import('../search/search.module').then(m => m.SearchModule)
      },
      {
        path: 'login',
        loadChildren: () => import('../login/login.module').then(m => m.LoginModule)
      },
      {
        path: 'content/:id',
        loadChildren: () => import('../content/content.module').then(m => m.ContentModule)
      },
      {
        path: 'map',
        children: [
          {
            path: '',
            loadChildren: () => import('../map/map.module').then(m => m.MapModule)
          }
        ]
      },
      {
        path: 'about',
        children: [
          {
            path: '',
            loadChildren: () => import('../about/about.module').then(m => m.AboutModule)
          }
        ]
      },
      {
        path: 'support',
        children: [
          {
            path: '',
            loadChildren: () => import('../support/support.module').then(m => m.SupportModule)
          }
        ]
      },
      {
        path: 'account',
        loadChildren: () => import('../account/account.module').then(m => m.AccountModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('../setting/setting.module').then(m => m.SettingModule)
      },
      {
        path: 'edit-profile',
        loadChildren: () => import('../editprofile/editprofile.module').then(m => m.EditprofileModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('../report/report.module').then(m => m.ReportModule)
      },
      {
        path: 'listing/:id',
        loadChildren: () => import('../listing/listing.module').then(m => m.ListingModule)
      },
      {
        path: 'verify-account/:id',
        loadChildren: () => import('../verifyaccount/verifyaccount.module').then(m => m.VerifyaccountModule)
      },
      {
        path: '',
        redirectTo: '/app/tabs/map',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }

