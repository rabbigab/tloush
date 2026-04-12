'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Listing } from '@/types/listings'
import { useListingsStore } from '@/store/listingsStore'

// Fix Leaflet default icon issue with webpack/next
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const selectedIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: 'selected-marker',
})

function formatPrice(price: number | null, currency: string): string {
  if (!price) return '?'
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₪'
  return `${price.toLocaleString('fr-IL')} ${symbol}`
}

interface ListingsMapProps {
  listings: Listing[]
}

export default function ListingsMap({ listings }: ListingsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  const { selectedId, setSelectedId, hoveredId } = useListingsStore()

  // Initialiser la carte
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [31.95, 34.85], // Centre d'Israel
      zoom: 8,
      zoomControl: true,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Mettre a jour les marqueurs quand les listings changent
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Supprimer les anciens marqueurs
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current.clear()

    const geoListings = listings.filter(l => l.latitude && l.longitude)

    // Ajouter les nouveaux marqueurs
    geoListings.forEach(listing => {
      if (!listing.latitude || !listing.longitude) return

      const marker = L.marker([listing.latitude, listing.longitude], {
        icon: listing.id === selectedId ? selectedIcon : defaultIcon,
      })

      const popup = `
        <div style="min-width: 180px; font-family: sans-serif;">
          <strong style="font-size: 14px;">${formatPrice(listing.price, listing.currency)}</strong>
          ${listing.listing_type === 'rent' ? '<span style="font-size: 11px; color: #888;">/mois</span>' : ''}
          <br/>
          <span style="font-size: 12px; color: #666;">
            ${[listing.street, listing.neighborhood, listing.city].filter(Boolean).join(', ')}
          </span>
          <br/>
          <span style="font-size: 12px; color: #999;">
            ${listing.rooms ? listing.rooms + ' pcs' : ''}
            ${listing.size_sqm ? '· ' + listing.size_sqm + ' m²' : ''}
            ${listing.floor !== null ? '· Et.' + listing.floor : ''}
          </span>
          <br/>
          <a href="${listing.source_url}" target="_blank" rel="noopener"
             style="font-size: 11px; color: #2563eb; text-decoration: none;">
            Voir sur ${listing.source === 'yad2' ? 'Yad2' : 'Facebook'} →
          </a>
        </div>
      `

      marker.bindPopup(popup)
      marker.on('click', () => setSelectedId(listing.id))
      marker.addTo(map)

      markersRef.current.set(listing.id, marker)
    })

    // Ajuster la vue pour montrer tous les marqueurs
    if (geoListings.length > 0) {
      const bounds = L.latLngBounds(
        geoListings.map(l => [l.latitude!, l.longitude!] as [number, number])
      )
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    }
  }, [listings, setSelectedId, selectedId])

  // Highlight le marqueur selectionne/hovere
  useEffect(() => {
    const activeId = selectedId || hoveredId
    markersRef.current.forEach((marker, id) => {
      marker.setIcon(id === activeId ? selectedIcon : defaultIcon)
      if (id === selectedId) {
        marker.openPopup()
      }
    })
  }, [selectedId, hoveredId])

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[400px] rounded-xl overflow-hidden z-0"
    />
  )
}
