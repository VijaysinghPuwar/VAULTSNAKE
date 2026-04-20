import os
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Mock tkinter before importing the main application
import sys
mock_tkinter = MagicMock()
sys.modules['tkinter'] = mock_tkinter

from main import _load_or_create_key
from ghost import SnakeGame

class TestApp(unittest.TestCase):

    def setUp(self):
        # Clean up created files before each test
        if Path("secret.key").exists():
            Path("secret.key").unlink()
        if Path("credentials.enc").exists():
            Path("credentials.enc").unlink()

    def tearDown(self):
        # Clean up created files after each test
        if Path("secret.key").exists():
            Path("secret.key").unlink()
        if Path("credentials.enc").exists():
            Path("credentials.enc").unlink()

    def test_key_creation(self):
        """Test that a new key is created if one doesn't exist."""
        self.assertFalse(Path("secret.key").exists())
        key = _load_or_create_key()
        self.assertTrue(Path("secret.key").exists())
        self.assertIsNotNone(key)
        self.assertIsInstance(key, bytes)

    def test_key_loading(self):
        """Test that an existing key is loaded correctly."""
        # Create a dummy key file
        key_content = b'test_key'
        Path("secret.key").write_bytes(key_content)

        key = _load_or_create_key()
        self.assertEqual(key, key_content)

    def test_snake_self_collision(self):
        """Test that the game ends on self-collision."""
        # Configure the mock to return an integer for the score
        mock_tkinter.IntVar.return_value.get.return_value = 0

        game = SnakeGame(user="testuser")
        # Position the snake so that it will collide with itself on the next tick
        game.snake = [(5, 5), (4, 5), (3, 5)]
        game.dir = (-1, 0) # Move left, next position is (4,5) which is a collision

        game._tick()
        self.assertTrue(game.game_over)


if __name__ == '__main__':
    unittest.main()
