import { Component } from "@angular/core";
import { RouterOutlet, Router, NavigationEnd } from "@angular/router";
import { CommonModule } from "@angular/common";
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { filter } from "rxjs";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <app-navbar *ngIf="showHeaderFooter"></app-navbar>
    <router-outlet></router-outlet>
    <app-footer *ngIf="showHeaderFooter"></app-footer>
  `,
  styles: [],
})
export class AppComponent {
  title = "University Event & Club Management System";
  showHeaderFooter = true;

  constructor(private router: Router) {
    // Listen to route changes and hide header/footer for login and register pages
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.url;

        // Hide navbar and footer on login and register pages
        // Account for hash location strategy: /#/login, /#/register
        this.showHeaderFooter = !(
          url === "/#/login" ||
          url === "/#/register" ||
          url.startsWith("/#/login?") ||
          url.startsWith("/#/register?")
        );
      });
  }
}