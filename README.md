# Palia Garden Tracker

A comprehensive garden management tool for Palia that helps you track your crops, manage watering schedules, and integrate with garden planners.

## 🌟 Features

### Real-time Palia Clock

- **Live Time Display**: Shows current Palia time with beautiful visual clock
- **Time Period Indicators**: Morning, Day, Evening, and Night periods with themed backgrounds
- **Daily Reset**: Automatically resets watering status at 6:00 AM Palia time

### Crop Tracking & Management

- **Manual Crop Addition**: Add crops manually to track watering status
- **Garden Planner Integration**: Import layouts directly from Palia Garden Planner
- **Watering Status**: Track which crops have been watered each day
- **Bulk Actions**: Water all crops or reset all watering status at once

### Data Persistence & Migration

- **Local Storage**: All data is saved locally in your browser
- **Legacy Migration**: Seamlessly migrate from older versions
- **Unified Store**: Modern state management with Zustand

### Garden Layout Management

- **Import from URL**: Import garden layouts from Palia Garden Planner URLs
- **Save Layouts**: Save and organize your favorite garden layouts
- **Layout Preview**: Visual preview of your garden with crop placement
- **Search & Filter**: Find saved layouts quickly with search and filtering

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/palia-garden-tracker.git
cd palia-garden-tracker
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 📱 Responsive Design

The application is fully responsive and works on:

- **Mobile devices** (320px+)
- **Tablets** (768px+)
- **Desktop** (1024px+)
- **Large screens** (1440px+)

## 🎮 How to Use

### Adding Crops Manually

1. Click "Manage Tracked Crops"
2. Select crops from the list
3. Use filters to find specific crops by buff, rarity, group, or price
4. Click "Save" to start tracking

### Importing from Garden Planner

1. Go to [Palia Garden Planner](https://palia-garden-planner.vercel.app/)
2. Design your garden layout
3. Copy the URL or save code
4. Click "Import from Planner" in the tracker
5. Paste the URL/code and preview your layout
6. Save the layout for future use

### Daily Watering

- Check off crops as you water them
- Use "Water All" for quick completion
- Status automatically resets at 6:00 AM Palia time
- Track your watering consistency over the last 5 cycles

## 🏗️ Technical Architecture

### Migration Phases

This project was built through a comprehensive 3-phase migration:

**Phase 1: Foundation Setup**

- Modern Next.js 15 with TypeScript
- Tailwind CSS for styling
- Shadcn/ui component library
- Zustand for state management

**Phase 2: Component Migration**

- Unified store architecture
- Component modernization
- Type safety improvements
- Service layer abstraction

**Phase 3: Final Integration & Testing**

- Store initialization
- Responsive design fixes
- Comprehensive testing
- Documentation completion

### Key Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern component library
- **Zustand**: Lightweight state management
- **Lucide React**: Beautiful icons

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   └── import/            # Import page
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── MainTracker.tsx   # Main application component
│   ├── ImportModal.tsx   # Garden import functionality
│   └── ...               # Other components
├── hooks/                # Custom React hooks
│   └── useUnifiedGardenStore.ts  # Main store
├── lib/                  # Utility libraries
│   └── services/         # Service layer
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🔧 Configuration

### Environment Variables

No environment variables are required for basic functionality. All data is stored locally.

### Customization

- Modify crop data in `public/crops.json`
- Adjust time calculations in `MainTracker.tsx`
- Customize styling in `app/globals.css`

## 🐛 Troubleshooting

### Common Issues

**Clock not updating**: Refresh the page to restart the time sync.

**Import not working**: Ensure the Palia Garden Planner URL is complete and valid.

**Data lost**: Check browser storage settings - data is stored locally.

**Responsive issues**: Clear browser cache and ensure you're using a modern browser.

### Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Palia game by Singularity 6
- Palia Garden Planner community
- Shadcn for the excellent UI components
- Next.js team for the amazing framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information

---

**Happy Gardening in Palia! 🌱**
