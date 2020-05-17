const router = new VueRouter({
  mode: 'history',
  base: '/prototyping/',
  routes: [
    {
      path: "/:project"
    },
  ]
});

const app = new Vue({
  router,
  data() {
    return {
      project: "",
      load: {
        barCount: 4.0,
        bar: false,
        show: false
      },
      hotspot: {
        activeItem: false,
        activeTimer: null
      },
      window: { x: 0, y: 0 },
      image: {
        original: 0,
        changed: 0,
        loading: false,
        badge: {
          show: false,
          timer: null
        }
      },
      config: {
        activePage: 1,
        zoom: 1
      }
    }
  },
  methods: {
    getWindowAxes($window, that, next) {
      that.window.x = $window.innerWidth();
      that.window.y = $window.innerHeight();

      $window.resize(() => {
        that.window.x = $window.innerWidth();
        that.window.y = $window.innerHeight();
      });

      next();
    },
    getImageAxes() {
      let $image = $("img.prototype__screen-image");
      Object.assign(this.image, {
        original: $image.prop("naturalWidth"),
        changed: $image.prop("naturalWidth"),
        loading: true
      })

      if (this.config.type === "mobile") {
        this.image.changed = 375;
      } else {
        let $window = $(window);
        ($window.innerWidth() <= this.image.original)
          ? this.image.changed = $window.innerWidth()
          : this.image.changed = $image.prop("naturalWidth");

        $window.resize(() => {
          ($window.innerWidth() <= this.image.original)
            ? this.image.changed = $window.innerWidth()
            : this.image.changed = $image.prop("naturalWidth");
        });
      }

      this.image.badge.show = true;
      clearInterval(this.image.badge.timer);
      this.image.badge.timer = setInterval(() => {
        this.image.badge.show = false;
      }, 1500)
    },
    getHotspotItems() {
      this.hotspot.activeItem = true;
      clearInterval(this.hotspot.activeTimer);
      this.hotspot.activeTimer = setInterval(() => {
        this.hotspot.activeItem = false;
      }, 250)
    },
    getPrototypeAction($item) {
      if (!$item) return false;
      this.hotspot.activeItem = false;
      this.config.activePage = $item.page;
    },
    getStylePercent($number) {
      return (($number/100)*this.getItemPercent).toFixed(0);
    },

    setNewZoom($type) {
      let $zoom = this.config.zoom.toFixed(2);
      if ($type === "minus") {
        if ($zoom > .5) this.config.zoom -= .25;
        if ($zoom <= .5 && $zoom > .1) this.config.zoom -= .1;
      }
      if ($type === "plus") {
        if ($zoom >= .5 && $zoom < 1) this.config.zoom += .25;
        if ($zoom < .5 && $zoom >= .1) this.config.zoom += .1;
      }
    },
    setActivePage($type) {
      // Scroll Top
      SimpleBar.instances.get(document.querySelector('[data-simplebar]')).contentWrapperEl.scrollTo(0,0);
      this.image.loading = false;

      if ($type === "next") {
        if (this.config.activePage < this.config.page) this.config.activePage += 1;
        if (this.config.activePage === this.config.page) this.config.activePage = 1;
      }
      if ($type === "prev") {
        if (this.config.activePage > 1) this.config.activePage -= 1;
        else this.config.activePage = this.config.page;
      }
    }
  },
  computed: {
    getHotspotWidth() {
      return this.image.changed > 0 ? this.image.changed +'px' : null;
    },
    getActivePageImageUrl() {
      return `projects/${this.project}/${this.config.activePage}.png`
    },
    getItemPercent() {
      return ((100 * this.image.changed)/this.image.original).toFixed(2);
    },
    getPrototypeList() {
      let pagePrototypeList = this.config.prototype["page"+this.config.activePage] || [];
      if (this.config.prototype["global"]) {
        this.config.prototype["global"].forEach(function(e) {
          if (pagePrototypeList.indexOf(e) === -1) pagePrototypeList.push(e);
        })
      }
      return pagePrototypeList;
    },
    getZoomValue() {
      return (this.config.zoom*100).toFixed(0);
    }
  },
  beforeCreate() {
    setInterval(() => {
      if (!this.load.bar) (this.load.barCount < 40) ? this.load.barCount += 1 : this.load.barCount += .1;
    }, 100);
  },
  created() {
    let that = this;
    if (this.$route.params.project) {
      // Set project Path/Name
      this.project = this.$route.params.project;

      // Get projects config file
      axios.get('projects/'+that.project+'/project.json').then(r => {
        if (typeof r.data !== "object") window.location.href = "https://statu.co";
        this.config = Object.assign(this.config, r.data);
      }).then(() => {
        document.title = this.config.name + " - Statu";
        $('meta[name="description"]').attr("content", this.config.description);
        this.config.activePage = 1;
      }).then(() => {
        that.getWindowAxes($(window), that, function() {
          that.getImageAxes($("img.prototype__screen-image"), that);
          setTimeout(() => {that.load.bar = true}, 500)
          setTimeout(() => {that.load.show = true}, 2000)
        });
      });
    } else {
      window.location.href = "https://statu.co";
    }
  },
  mounted() {
    let that = this;
    $(document).bind('keyup', function(event) {
      // if (event.keyCode === 27) that.close();
      if (event.keyCode === 37) that.setActivePage('prev');
      if (event.keyCode === 39) that.setActivePage('next');
    });
  },
}).$mount('#app');

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('sw.js').then(() => console.log("[SW] Is activated."));
// }
